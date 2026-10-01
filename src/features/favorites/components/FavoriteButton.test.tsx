import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/api/apiError'
import { useCurrentMember } from '../../auth/hooks/useCurrentMember'
import { addFavorite, getFavorites, removeFavorite } from '../api/favoriteApi'
import { FavoriteButton } from './FavoriteButton'

vi.mock('../../auth/hooks/useCurrentMember', () => ({ useCurrentMember: vi.fn() }))
vi.mock('../api/favoriteApi', () => ({
  getFavorites: vi.fn(), addFavorite: vi.fn(), removeFavorite: vi.fn(),
}))

const useCurrentMemberMock = vi.mocked(useCurrentMember)
const getFavoritesMock = vi.mocked(getFavorites)
const addFavoriteMock = vi.mocked(addFavorite)
const removeFavoriteMock = vi.mocked(removeFavorite)

function renderButton() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><FavoriteButton courseId={17} /></QueryClientProvider>)
}

describe('FavoriteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCurrentMemberMock.mockReturnValue({ data: { id: 1, name: '테스터', email: 'test@example.com', gender: 'UNKNOWN', role: 'USER' }, isPending: false } as ReturnType<typeof useCurrentMember>)
    getFavoritesMock.mockResolvedValue([])
    addFavoriteMock.mockResolvedValue({ courseId: 17, favorited: true })
    removeFavoriteMock.mockResolvedValue({ courseId: 17, favorited: false })
  })

  it('shows_login_prompt_for_anonymous_favorite', async () => {
    const user = userEvent.setup()
    useCurrentMemberMock.mockReturnValue({ data: null, isPending: false } as ReturnType<typeof useCurrentMember>)
    renderButton()
    await user.click(screen.getByRole('button', { name: '찜하기' }))
    expect(screen.getByText('찜하려면 로그인이 필요합니다.')).toBeInTheDocument()
  })

  it('links_login_to_oauth_entry', async () => {
    const user = userEvent.setup()
    useCurrentMemberMock.mockReturnValue({ data: null, isPending: false } as ReturnType<typeof useCurrentMember>)
    renderButton()
    await user.click(screen.getByRole('button', { name: '찜하기' }))
    expect(screen.getByRole('link', { name: '카카오로 로그인' })).toHaveAttribute('href', '/oauth2/authorization/kakao')
  })

  it('shows_initial_favorite_from_favorite_list', async () => {
    getFavoritesMock.mockResolvedValue([{ courseId: 17 } as Awaited<ReturnType<typeof getFavorites>>[number]])
    renderButton()
    expect(await screen.findByRole('button', { name: '찜 취소' })).toBeInTheDocument()
  })

  it('adds_and_removes_favorite', async () => {
    const user = userEvent.setup()
    renderButton()
    await user.click(await screen.findByRole('button', { name: '찜하기' }))
    await waitFor(() => expect(addFavoriteMock).toHaveBeenCalledWith(17))
    await user.click(await screen.findByRole('button', { name: '찜 취소' }))
    await waitFor(() => expect(removeFavoriteMock).toHaveBeenCalledWith(17))
  })

  it('rolls_back_optimistic_state_on_failure', async () => {
    const user = userEvent.setup()
    addFavoriteMock.mockRejectedValue(new ApiError('FAVORITE_FAILED', '찜을 변경하지 못했습니다.'))
    renderButton()
    await user.click(await screen.findByRole('button', { name: '찜하기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('찜을 변경하지 못했습니다.')
    expect(screen.getByRole('button', { name: '찜하기' })).toBeInTheDocument()
  })
})
