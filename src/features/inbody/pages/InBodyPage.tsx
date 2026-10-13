import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useCurrentMember } from '../../auth/hooks/useCurrentMember'
import { backendOrigin } from '../../../shared/api/backendOrigin'
import { getHome } from '../../home/api/homeApi'
import { InBodyPhotoPanel } from '../components/InBodyPhotoPanel'
import styles from './InBodyPage.module.css'

export function InBodyPage() {
  const member = useCurrentMember()
  const queryClient = useQueryClient()
  const home = useQuery({ queryKey: ['home'], queryFn: getHome, enabled: !!member.data })

  if (member.isPending) return <p role="status">로그인 상태를 확인하는 중입니다.</p>
  if (member.isError) return <div role="alert">로그인 상태를 확인하지 못했습니다. <button type="button" onClick={() => member.refetch()}>다시 시도</button></div>
  if (!member.data) return <section className={styles.gate}><h1>인바디 기록</h1><p>인바디 사진 분석과 기록 저장에는 로그인이 필요합니다.</p><a href={`${backendOrigin || ''}/oauth2/authorization/kakao`}>카카오 로그인</a></section>

  return <div className={styles.page}>
    <header><h1>인바디 기록</h1><p>사진에서 추출한 수치를 확인하고 저장하면 AI 운동 추천에 사용할 수 있어요.</p></header>
    <InBodyPhotoPanel
      saveLabel="인바디 기록 저장하기"
      successMessage="인바디 기록을 저장했습니다. AI 운동 추천에서 이 기록을 사용할 수 있습니다."
      retryLabel="저장된 기록 다시 불러오기"
      onSaved={async () => { await queryClient.invalidateQueries({ queryKey: ['home'] }) }}
    />
    <section className={styles.latest}>
      <h2>최근 기록</h2>
      {home.isPending && <p>기록을 불러오는 중입니다.</p>}
      {home.isError && <p role="alert">최근 기록을 불러오지 못했습니다. <button type="button" onClick={() => home.refetch()}>다시 시도</button></p>}
      {home.data && (home.data.latestInBody ? <p>체중 {home.data.latestInBody.weightKg}kg · 골격근량 {home.data.latestInBody.skeletalMuscleMassKg}kg · 체지방률 {home.data.latestInBody.bodyFatPercentage}%</p> : <p>저장된 인바디 기록이 없습니다.</p>)}
      <Link to="/recommend">AI 운동 추천으로 이동</Link>
    </section>
  </div>
}
