import { Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<PlaceholderPage title="ClassFit" description="내게 맞는 공공 체육 강좌를 찾아보세요." />} />
        <Route path="courses" element={<PlaceholderPage title="강좌 찾기" description="원하는 지역과 종목의 강좌를 검색합니다." />} />
        <Route path="courses/:courseId" element={<PlaceholderPage title="강좌 상세" description="강좌 정보를 확인합니다." />} />
        <Route path="recommend" element={<PlaceholderPage title="AI 운동 추천" description="나에게 맞는 운동을 추천받습니다." />} />
        <Route path="inbody" element={<PlaceholderPage title="인바디" description="신체 기록을 관리합니다." />} />
        <Route path="favorites" element={<PlaceholderPage title="찜" description="관심 있는 강좌를 모아봅니다." />} />
      </Route>
    </Routes>
  )
}
