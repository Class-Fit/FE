import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { AppShell } from './AppShell'

const ok = (data: unknown) => HttpResponse.json({ success: true, data, errorCode: null, message: null })
const server = setupServer(
  http.get('*/api/members/me', () => HttpResponse.json({ success: false, data: null, errorCode: 'UNAUTHORIZED', message: '로그인이 필요합니다.' }, { status: 401 })),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderShell(child = <p>자식 화면</p>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/courses']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="courses" element={child} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AppShell', () => {
  it('renders_desktop_and_mobile_navigation', () => {
    renderShell()

    for (const label of ['홈', '강좌 찾기', 'AI 운동 추천', '인바디', '찜']) {
      expect(screen.getAllByText(label)).toHaveLength(2)
    }

    for (const link of document.querySelectorAll('a[href="/courses"]')) {
      expect(link).toHaveAttribute('href', '/courses')
    }
    expect(document.querySelectorAll('a[href="/courses"]')).toHaveLength(2)
  })

  it('renders_nested_route_content', () => {
    renderShell(<h1>강좌 검색 결과</h1>)

    expect(screen.getByRole('heading', { name: '강좌 검색 결과' })).toBeInTheDocument()
  })

  it('links_to_kakao_login_when_signed_out', async () => {
    renderShell()

    expect(await screen.findByRole('link', { name: '카카오 로그인' }))
      .toHaveAttribute('href', '/oauth2/authorization/kakao')
  })

  it('shows_logout_instead_of_login_and_clears_session_state', async () => {
    let sentToken = ''
    server.use(
      http.get('*/api/members/me', () => ok({ id: 1, name: '테스터', email: 'test@example.com', gender: 'UNKNOWN', role: 'USER' })),
      http.get('*/api/auth/csrf', () => ok({ token: 'csrf-token' })),
      http.post('*/api/auth/logout', ({ request }) => {
        sentToken = request.headers.get('X-CSRF-TOKEN') ?? ''
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderShell()

    const logout = await screen.findByRole('button', { name: '로그아웃' })
    expect(screen.queryByRole('link', { name: '카카오 로그인' })).not.toBeInTheDocument()
    await user.click(logout)

    await waitFor(() => expect(sentToken).toBe('csrf-token'))
    expect(await screen.findByRole('link', { name: '카카오 로그인' })).toBeInTheDocument()
  })

  it('keeps_logout_visible_when_server_rejects_logout', async () => {
    server.use(
      http.get('*/api/members/me', () => ok({ id: 1, name: '테스터', email: 'test@example.com', gender: 'UNKNOWN', role: 'USER' })),
      http.get('*/api/auth/csrf', () => HttpResponse.json({ success: false, data: null, errorCode: 'FORBIDDEN', message: '접근 권한이 없습니다.' }, { status: 403 })),
    )
    const user = userEvent.setup()
    renderShell()

    await user.click(await screen.findByRole('button', { name: '로그아웃' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('로그아웃하지 못했습니다.')
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeEnabled()
    expect(screen.queryByRole('link', { name: '카카오 로그인' })).not.toBeInTheDocument()
  })
})
