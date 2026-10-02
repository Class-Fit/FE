import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, X } from 'lucide-react'
import { ApiError } from '../../../shared/api/apiError'
import { backendOrigin } from '../../../shared/api/backendOrigin'
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
    onError: (error) => {
      setOptimisticState(null)
      setErrorMessage(error instanceof ApiError ? error.message : '찜을 변경하지 못했습니다.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['favorites'] })
      setOptimisticState(null)
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

  const stateUnavailable = memberQuery.isError || (Boolean(memberQuery.data) && !favoritesQuery.isSuccess)

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.favoriteButton} ${favorited ? styles.active : ''}`}
        aria-label={favorited ? '찜 취소' : '찜하기'}
        aria-pressed={favorited}
        disabled={memberQuery.isPending || stateUnavailable || mutation.isPending}
        onClick={toggleFavorite}
      >
        <Heart aria-hidden="true" fill={favorited ? 'currentColor' : 'none'} />
        <span>{favorited ? '찜한 강좌' : '찜하기'}</span>
      </button>

      {memberQuery.isError && (
        <div className={styles.status} role="alert">
          <span>로그인 상태를 확인하지 못했습니다.</span>
          <button type="button" onClick={() => memberQuery.refetch()}>로그인 상태 다시 시도</button>
        </div>
      )}

      {memberQuery.data && favoritesQuery.isError && (
        <div className={styles.status} role="alert">
          <span>찜 상태를 확인하지 못했습니다.</span>
          <button type="button" onClick={() => favoritesQuery.refetch()}>찜 상태 다시 시도</button>
        </div>
      )}

      {showLogin && !memberQuery.data && (
        <div className={styles.loginPrompt} role="dialog" aria-label="로그인 안내">
          <button type="button" className={styles.close} aria-label="로그인 안내 닫기" onClick={() => setShowLogin(false)}><X aria-hidden="true" /></button>
          <strong>찜하려면 로그인이 필요합니다.</strong>
          <p>카카오 계정으로 로그인하고 관심 강좌를 모아보세요.</p>
          <a href={`${backendOrigin}/oauth2/authorization/kakao`}>카카오로 로그인</a>
        </div>
      )}

      {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
    </div>
  )
}
