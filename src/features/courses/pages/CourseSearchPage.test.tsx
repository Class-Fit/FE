import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PageResponse } from '../../../shared/types/page'
import { getCourses } from '../api/courseApi'
import type { CourseSummary } from '../api/courseTypes'
import { CourseSearchPage } from './CourseSearchPage'

vi.mock('../api/courseApi', () => ({ getCourses: vi.fn() }))

const getCoursesMock = vi.mocked(getCourses)
const course: CourseSummary = {
  courseId: 17,
  courseName: '퇴근 후 수영 초급반',
  sportCode: '12',
  sportName: '수영',
  facilityName: '원주국민체육센터',
  address: '강원특별자치도 원주시 건강로 1',
  startTime: '19:00',
  endTime: '20:00',
  weekdays: '월, 수, 금',
  fee: 35000,
}

function page(overrides: Partial<PageResponse<CourseSummary>> = {}): PageResponse<CourseSummary> {
  return {
    content: [course], page: 0, size: 20, totalCount: 1, totalPages: 1, first: true, last: true,
    ...overrides,
  }
}

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

function renderPage(initialEntry = '/courses') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="courses" element={<><CourseSearchPage /><LocationProbe /></>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CourseSearchPage', () => {
  beforeEach(() => {
    getCoursesMock.mockReset()
    getCoursesMock.mockResolvedValue(page())
  })

  it('reads_filters_from_url', async () => {
    renderPage('/courses?keyword=수영&localCode=11110&sportCode=12&page=2')

    expect(screen.getByRole('searchbox', { name: '강좌명 또는 시설명' })).toHaveValue('수영')
    expect(screen.getByRole('combobox', { name: '지역' })).toHaveValue('11110')
    expect(screen.getByRole('combobox', { name: '종목' })).toHaveValue('12')
    await waitFor(() => expect(getCoursesMock).toHaveBeenCalledWith({ keyword: '수영', localCode: '11110', sportCode: '12', page: 2 }))
  })

  it('submits_trimmed_filters_and_resets_page', async () => {
    const user = userEvent.setup()
    renderPage('/courses?keyword=수영&page=4')

    const input = screen.getByRole('searchbox', { name: '강좌명 또는 시설명' })
    await user.clear(input)
    await user.type(input, '  요가  ')
    await user.click(screen.getByRole('button', { name: '검색' }))

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('keyword=%EC%9A%94%EA%B0%80'))
    expect(screen.getByTestId('location')).not.toHaveTextContent('page=4')
  })

  it('renders_total_count_and_courses', async () => {
    getCoursesMock.mockResolvedValue(page({ totalCount: 42 }))
    renderPage()

    expect(await screen.findByText('총 42개의 강좌')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '퇴근 후 수영 초급반' })).toBeInTheDocument()
  })

  it('converts_server_page_to_user_page', async () => {
    getCoursesMock.mockResolvedValue(page({ page: 1, totalCount: 60, totalPages: 3, first: false, last: false }))
    renderPage('/courses?page=1')

    expect(await screen.findByRole('button', { name: '2페이지' })).toHaveAttribute('aria-current', 'page')
  })

  it('normalizes_invalid_page_to_zero', async () => {
    renderPage('/courses?page=-7')
    await waitFor(() => expect(getCoursesMock).toHaveBeenCalledWith({ page: 0 }))
  })

  it('renders_empty_state', async () => {
    getCoursesMock.mockResolvedValue(page({ content: [], totalCount: 0, totalPages: 0 }))
    renderPage()
    expect(await screen.findByText('조건에 맞는 강좌가 없습니다.')).toBeInTheDocument()
  })

  it('renders_retry_for_api_error', async () => {
    const user = userEvent.setup()
    getCoursesMock.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(page())
    renderPage()

    await user.click(await screen.findByRole('button', { name: '다시 시도' }))
    await waitFor(() => expect(getCoursesMock).toHaveBeenCalledTimes(2))
  })
})
