import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { App } from './App'

const server = setupServer(
  http.get('*/api/members/me', () => HttpResponse.json({ success: false, data: null, errorCode: 'UNAUTHORIZED', message: '로그인이 필요합니다.' }, { status: 401 })),
  http.get('*/api/home', () => HttpResponse.json({ success: true, data: {
    member: { loggedIn: false, id: null, name: null },
    popularCourses: [{ courseId: 1, courseName: '인기 수영', sportCode: '01', sportName: '수영', facilityName: '체육관', address: '원주시', startTime: '09:00', endTime: '10:00', weekdays: '월', fee: 10000 }],
    latestCourses: [], latestInBody: null,
  }, errorCode: null, message: null })),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('App', () => {
  it('shows_backend_home_courses', async () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('link', { name: '인기 수영' })).toHaveAttribute('href', '/courses/1')
  })

  it('opens_inbody_photo_record_page', async () => {
    server.use(http.get('*/api/members/me', () => HttpResponse.json({ success: true, data: { id: 1, name: '테스터', email: 'test@example.com', gender: null, role: 'USER' }, errorCode: null, message: null })))
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/inbody']}><App /></MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '인바디 기록' })).toBeInTheDocument()
    expect(screen.getByLabelText('인바디 사진')).toBeInTheDocument()
  })

  it('saves_missing_gender_from_inbody_page_and_updates_member_state', async () => {
    const user = userEvent.setup()
    let savedGender: string | null = null
    server.use(
      http.get('*/api/members/me', () => HttpResponse.json({ success: true, data: { id: 1, name: '테스터', email: 'test@example.com', gender: savedGender, role: 'USER' }, errorCode: null, message: null })),
      http.get('*/api/auth/csrf', () => HttpResponse.json({ success: true, data: { token: 'test-csrf' }, errorCode: null, message: null })),
      http.patch('*/api/members/me/gender', async ({ request }) => {
        expect(request.headers.get('X-CSRF-TOKEN')).toBe('test-csrf')
        savedGender = (await request.json() as { gender: string }).gender
        return HttpResponse.json({ success: true, data: { id: 1, name: '테스터', email: 'test@example.com', gender: savedGender, role: 'USER' }, errorCode: null, message: null })
      }),
    )
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/inbody']}><App /></MemoryRouter>
      </QueryClientProvider>,
    )

    await user.selectOptions(await screen.findByRole('combobox', { name: '성별' }), 'FEMALE')
    await user.click(screen.getByRole('button', { name: '성별 저장' }))
    await waitFor(() => expect(savedGender).toBe('FEMALE'))
    expect(await screen.findByText('현재 성별: 여성')).toBeInTheDocument()
  })

  it('shows_saved_courses_and_removes_an_unfavorited_course', async () => {
    const user = userEvent.setup()
    let saved = true
    server.use(
      http.get('*/api/members/me', () => HttpResponse.json({ success: true, data: { id: 1, name: '테스터', email: 'test@example.com', gender: null, role: 'USER' }, errorCode: null, message: null })),
      http.get('*/api/members/me/favorites', () => HttpResponse.json({ success: true, data: saved ? [{ courseId: 17, courseName: '원주 수영 교실', sportCode: '12', sportName: '수영', facilityName: '원주체육관', address: '강원특별자치도 원주시', startTime: '09:00', endTime: '10:00', weekdays: '월', fee: 10000 }] : [], errorCode: null, message: null })),
      http.delete('*/api/courses/17/favorites', () => {
        saved = false
        return HttpResponse.json({ success: true, data: { courseId: 17, favorited: false }, errorCode: null, message: null })
      }),
    )
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/favorites']}><App /></MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('link', { name: '원주 수영 교실' })).toHaveAttribute('href', '/courses/17')
    await user.click(screen.getByRole('button', { name: '찜 취소' }))
    await waitFor(() => expect(screen.queryByRole('link', { name: '원주 수영 교실' })).not.toBeInTheDocument())
    expect(screen.getByText('아직 찜한 강좌가 없습니다.')).toBeInTheDocument()
  })
})
