import { render, screen } from '@testing-library/react'
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
    server.use(http.get('*/api/members/me', () => HttpResponse.json({ success: true, data: { id: 1, name: '테스터', email: 'test@example.com', gender: 'UNKNOWN', role: 'USER' }, errorCode: null, message: null })))
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/inbody']}><App /></MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '인바디 기록' })).toBeInTheDocument()
    expect(screen.getByLabelText('인바디 사진')).toBeInTheDocument()
  })
})
