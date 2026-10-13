import { Route, Routes } from 'react-router-dom'
import { CourseDetailPage } from '../features/courses/pages/CourseDetailPage'
import { CourseSearchPage } from '../features/courses/pages/CourseSearchPage'
import { HomePage } from '../features/home/pages/HomePage'
import { ChatPage } from '../features/chat/pages/ChatPage'
import { InBodyPage } from '../features/inbody/pages/InBodyPage'
import { FavoritesPage } from '../features/favorites/pages/FavoritesPage'
import { AppShell } from './layout/AppShell'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CourseSearchPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        <Route path="recommend" element={<ChatPage />} />
        <Route path="inbody" element={<InBodyPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
      </Route>
    </Routes>
  )
}
