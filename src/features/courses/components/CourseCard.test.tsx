import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { CourseSummary } from '../api/courseTypes'
import { CourseCard } from './CourseCard'

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

describe('CourseCard', () => {
  it('renders_course_summary_as_accessible_link', () => {
    const { container } = render(
      <MemoryRouter>
        <CourseCard course={course} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: '퇴근 후 수영 초급반' })).toHaveAttribute('href', '/courses/17')
    expect(screen.getByText('원주국민체육센터')).toBeInTheDocument()
    expect(screen.getByText('강원특별자치도 원주시 건강로 1')).toBeInTheDocument()
    expect(screen.getByText('월, 수, 금 · 19:00–20:00')).toBeInTheDocument()
    expect(screen.getByText('35,000원')).toBeInTheDocument()

    for (const icon of container.querySelectorAll('svg')) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
  })
})
