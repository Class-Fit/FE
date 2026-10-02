import { unwrapApiResponse, type ApiResponse } from '../../../shared/api/apiResponse'
import { httpClient } from '../../../shared/api/httpClient'
import type { PageResponse } from '../../../shared/types/page'
import type { CourseDetail, CourseSearchParams, CourseSummary } from './courseTypes'

function meaningfulValue(value: string | undefined) {
  const normalized = value?.trim()
  return normalized && normalized !== 'all' ? normalized : undefined
}

export async function getCourses(params: CourseSearchParams = {}): Promise<PageResponse<CourseSummary>> {
  const requestParams = {
    ...(meaningfulValue(params.localCode) && { localCode: meaningfulValue(params.localCode) }),
    ...(meaningfulValue(params.sportCode) && { sportCode: meaningfulValue(params.sportCode) }),
    ...(meaningfulValue(params.keyword) && { keyword: meaningfulValue(params.keyword) }),
    page: params.page ?? 0,
    ...(params.size !== undefined && { size: params.size }),
  }
  const response = await httpClient.get<ApiResponse<PageResponse<CourseSummary>>>('/api/courses', {
    params: requestParams,
  })

  return unwrapApiResponse(response.data)
}

export async function getCourse(courseId: number): Promise<CourseDetail> {
  const response = await httpClient.get<ApiResponse<CourseDetail>>(`/api/courses/${courseId}`)
  return unwrapApiResponse(response.data)
}
