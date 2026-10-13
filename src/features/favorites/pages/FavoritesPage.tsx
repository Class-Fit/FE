import { useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { backendOrigin } from '../../../shared/api/backendOrigin'
import { useCurrentMember } from '../../auth/hooks/useCurrentMember'
import { CourseCard } from '../../courses/components/CourseCard'
import { getFavorites } from '../api/favoriteApi'
import { FavoriteButton } from '../components/FavoriteButton'
import styles from './FavoritesPage.module.css'

export function FavoritesPage() {
  const member = useCurrentMember()
  const favorites = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: Boolean(member.data),
    retry: false,
  })

  if (member.isPending) return <p role="status">로그인 상태를 확인하는 중입니다.</p>
  if (member.isError) return <div role="alert">로그인 상태를 확인하지 못했습니다. <button type="button" onClick={() => member.refetch()}>다시 시도</button></div>

  return <section className={styles.page}>
    <header className={styles.header}>
      <span>MY FAVORITES</span>
      <h1>찜한 강좌</h1>
      <p>관심 있는 강좌를 한곳에서 확인해 보세요.</p>
    </header>

    {!member.data ? <div className={styles.state}>
      <Heart aria-hidden="true" size={36} />
      <h2>로그인이 필요합니다.</h2>
      <p>카카오 계정으로 로그인하고 찜한 강좌를 확인하세요.</p>
      <a className={styles.action} href={`${backendOrigin || ''}/oauth2/authorization/kakao`}>카카오 로그인</a>
    </div> : <>
      {favorites.isPending && <p role="status">찜한 강좌를 불러오는 중입니다.</p>}
      {favorites.isError && <div className={styles.state} role="alert">
        <h2>찜한 강좌를 불러오지 못했습니다.</h2>
        <p>잠시 후 다시 시도해 주세요.</p>
        <button className={styles.action} type="button" onClick={() => favorites.refetch()}>다시 시도</button>
      </div>}
      {favorites.data && (favorites.data.length === 0 ? <div className={styles.state}>
        <Heart aria-hidden="true" size={36} />
        <h2>아직 찜한 강좌가 없습니다.</h2>
        <p>강좌 상세 화면에서 마음에 드는 강좌를 찜해 보세요.</p>
        <Link className={styles.action} to="/courses">강좌 찾기</Link>
      </div> : <>
        <p className={styles.count}>총 {favorites.data.length.toLocaleString('ko-KR')}개의 강좌</p>
        <div className={styles.grid}>
          {favorites.data.map((course) => <CourseCard key={course.courseId} course={course} favoriteAction={<FavoriteButton courseId={course.courseId} />} />)}
        </div>
      </>)}
    </>}
  </section>
}
