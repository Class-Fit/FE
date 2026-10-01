import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../../../shared/api/httpClient'
import { getCourse, getCourses } from './courseApi'

vi.mock('../../../shared/api/httpClient', () => ({
  httpClient: { get: vi.fn() },
}))

const getMock = vi.mocked(httpClient.get)

describe('courseApi', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('omits_blank_and_all_search_params', async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: { content: [], page: 0, size: 20, totalCount: 0, totalPages: 0, first: true, last: true },
        errorCode: null,
        message: null,
      },
    })

    await getCourses({ keyword: '   ', localCode: 'all', sportCode: 'all', page: 0 })

    expect(getMock).toHaveBeenCalledWith('/api/courses', { params: { page: 0 } })
  })

  it('requests_course_detail_by_id', async () => {
    const detail = { courseId: 23, courseName: '아침 수영' }
    getMock.mockResolvedValue({
      data: { success: true, data: detail, errorCode: null, message: null },
    })

    await expect(getCourse(23)).resolves.toEqual(detail)
    expect(getMock).toHaveBeenCalledWith('/api/courses/23')
  })
})
