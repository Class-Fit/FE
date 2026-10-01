import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, X } from 'lucide-react'
import { ApiError } from '../../../shared/api/apiError'
import { useCurrentMember } from '../../auth/hooks/useCurrentMember'
import { addFavorite, getFavorites, removeFavorite } from '../api/favoriteApi'
import styles from './FavoriteButton.module.css'

export function FavoriteButton({ courseId }: { courseId: number }) {
  const queryClient = useQueryClient()
  const memberQuery = useCurrentMember()
  const [showLogin, setShowLogin] = useState(false)
  const [optimisticState, setOptimisticState] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: Boolean(memberQuery.data),
    retry: false,
  })
  const serverState = favoritesQuery.data?.some((course) => course.courseId === courseId) ?? false
  const favorited = optimisticState ?? serverState

  const mutation = useMutation({
    mutationFn: (next: boolean) => next ? addFavorite(courseId) : removeFavorite(courseId),
    onMutate: (next) => {
      const previous = favorited
      setErrorMessage(null)
      setOptimisticState(next)
      return { previous }
    },
    onError: (error, _next, context) => {
      setOptimisticState(context?.previous ?? serverState)
      setErrorMessage(error instanceof ApiError ? error.message : '찜을 변경하지 못했습니다.')
    },
    onSuccess: (_result, next) => {
      setOptimisticState(next)
      void queryClient.invalidateQueries({ queryKey: ['favorites'] })
      void queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })

  function toggleFavorite() {
    if (!memberQuery.data) {
      setShowLogin(true)
      return
    }
    mutation.mutate(!favorited)
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.favoriteButton} ${favorited ? styles.active : ''}`}
        aria-label={favorited ? '찜 취소' : '찜하기'}
        aria-pressed={favorited}
        disabled={memberQuery.isPending || (Boolean(memberQuery.data) && favoritesQuery.isPending) || mutation.isPending}
        onClick={toggleFavorite}
      >
        <Heart aria-hidden="true" fill={favorited ? 'currentColor' : 'none'} />
        <span>{favorited ? '찜한 강좌' : '찜하기'}</span>
      </button>

      {showLogin && !memberQuery.data && (
        <div className={styles.loginPrompt} role="dialog" aria-label="로그인 안내">
          <button type="button" className={styles.close} aria-label="로그인 안내 닫기" onClick={() => setShowLogin(false)}><X aria-hidden="true" /></button>
          <strong>찜하려면 로그인이 필요합니다.</strong>
          <p>카카오 계정으로 로그인하고 관심 강좌를 모아보세요.</p>
          <a href="/oauth2/authorization/kakao">카카오로 로그인</a>
        </div>
      )}

      {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
    </div>
  )
}
