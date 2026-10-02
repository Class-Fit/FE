import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { FavoriteButton } from './FavoriteButton'

const ok = (data: unknown) => HttpResponse.json({ success: true, data, errorCode: null, message: null })
let favoriteIds: number[] = []
const server = setupServer(
  http.get('*/api/members/me', () => ok({ id: 1, name: '테스터', email: 'test@example.com', gender: 'UNKNOWN', role: 'USER' })),
  http.get('*/api/members/me/favorites', () => ok(favoriteIds.map((courseId) => ({ courseId })))),
  http.post('*/api/courses/:id/favorites', ({ params }) => {
    favoriteIds.push(Number(params.id))
    return ok({ courseId: Number(params.id), favorited: true })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  favoriteIds = []
})
afterAll(() => server.close())

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
}

describe('favorite HTTP boundaries', () => {
  it('preserves_server_message_for_failed_favorite_mutation', async () => {
    server.use(http.post('*/api/courses/:id/favorites', () => HttpResponse.json({
      success: false, data: null, errorCode: 'FORBIDDEN', message: '접근 권한이 없습니다.',
    }, { status: 403 })))
    const user = userEvent.setup()
    render(<QueryClientProvider client={createClient()}><FavoriteButton courseId={17} /></QueryClientProvider>)
    await waitFor(() => expect(screen.getByRole('button', { name: '찜하기' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: '찜하기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('접근 권한이 없습니다.')
  })

  it('uses_refreshed_server_state_after_optimistic_toggle', async () => {
    const user = userEvent.setup()
    const queryClient = createClient()
    render(<QueryClientProvider client={queryClient}><FavoriteButton courseId={17} /></QueryClientProvider>)
    await waitFor(() => expect(screen.getByRole('button', { name: '찜하기' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: '찜하기' }))
    await waitFor(() => expect(queryClient.getQueryData(['favorites'])).toEqual([{ courseId: 17 }]))
    favoriteIds = []
    await act(async () => { await queryClient.invalidateQueries({ queryKey: ['favorites'] }) })
    expect(queryClient.getQueryData(['favorites'])).toEqual([])
    await waitFor(() => expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false'))
  })

  it('disables_mutation_and_offers_retry_when_favorite_state_fails', async () => {
    server.use(http.get('*/api/members/me/favorites', () => HttpResponse.json({
      success: false, data: null, errorCode: 'INTERNAL_SERVER_ERROR', message: '서버 내부 오류가 발생했습니다.',
    }, { status: 500 })))
    render(<QueryClientProvider client={createClient()}><FavoriteButton courseId={17} /></QueryClientProvider>)
    expect(await screen.findByText('찜 상태를 확인하지 못했습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '찜하기' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '찜 상태 다시 시도' })).toBeEnabled()
  })
})
