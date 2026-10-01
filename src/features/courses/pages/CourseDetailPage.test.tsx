import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/api/apiError'
import { getCourse } from '../api/courseApi'
import type { CourseDetail } from '../api/courseTypes'
import { CourseDetailPage } from './CourseDetailPage'

vi.mock('../api/courseApi', () => ({ getCourse: vi.fn() }))
const getCourseMock = vi.mocked(getCourse)

const detail: CourseDetail = {
  courseId: 17,
  courseName: '퇴근 후 수영 초급반',
  sportCode: '12',
  sportName: '수영',
  instructorName: '김코치',
  startTime: '19:00',
  endTime: '20:00',
  weekdays: '월, 수, 금',
  fee: 35000,
  description: '기초 호흡부터 배우는 성인 수영 강좌입니다.',
  facilityName: '원주국민체육센터',
  address: '강원특별자치도 원주시 건강로 1',
  cityName: '강원특별자치도',
  localName: '원주시',
}

function renderPage(courseId = '17') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/courses/${courseId}`]}>
        <Routes>
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CourseDetailPage', () => {
  beforeEach(() => {
    getCourseMock.mockReset()
    getCourseMock.mockResolvedValue(detail)
  })

  it('renders_course_information', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { name: detail.courseName })).toBeInTheDocument()
    expect(screen.getAllByText('수영')).toHaveLength(2)
    for (const text of ['김코치', '월, 수, 금 · 19:00–20:00', '35,000원', detail.address, detail.description!]) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    expect(screen.getAllByText('원주국민체육센터')).toHaveLength(2)
    expect(screen.getByRole('link', { name: '강좌 목록으로' })).toHaveAttribute('href', '/courses')
  })

  it('hides_missing_optional_fields', async () => {
    getCourseMock.mockResolvedValue({ ...detail, sportName: null, instructorName: null, description: ' ' })
    renderPage()
    await screen.findByRole('heading', { name: detail.courseName })
    expect(screen.queryByText('강사')).not.toBeInTheDocument()
    expect(screen.queryByText('강좌 소개')).not.toBeInTheDocument()
    expect(screen.queryByText('종목')).not.toBeInTheDocument()
  })

  it.each([[0, '무료'], [null, '비용 문의'], [35000, '35,000원']] as const)('renders_fee_%s', async (fee, label) => {
    getCourseMock.mockResolvedValue({ ...detail, fee })
    renderPage()
    expect(await screen.findByText(label)).toBeInTheDocument()
  })

  it('renders_not_found_recovery', async () => {
    getCourseMock.mockRejectedValue(new ApiError('COURSE_NOT_FOUND', '강좌를 찾을 수 없습니다.'))
    renderPage()
    expect(await screen.findByRole('heading', { name: '강좌를 찾을 수 없습니다.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '강좌 목록으로' })).toHaveAttribute('href', '/courses')
  })

  it('rejects_invalid_course_id_without_request', async () => {
    renderPage('invalid')
    expect(await screen.findByRole('heading', { name: '올바르지 않은 강좌 주소입니다.' })).toBeInTheDocument()
    expect(getCourseMock).not.toHaveBeenCalled()
  })

  it('renders_retry_for_server_error', async () => {
    const user = userEvent.setup()
    getCourseMock.mockRejectedValueOnce(new Error('server')).mockResolvedValueOnce(detail)
    renderPage()
    await user.click(await screen.findByRole('button', { name: '다시 시도' }))
    await waitFor(() => expect(getCourseMock).toHaveBeenCalledTimes(2))
  })
})
