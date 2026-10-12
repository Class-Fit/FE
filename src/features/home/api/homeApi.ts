import type { CourseSummary } from '../../courses/api/courseTypes'
import { unwrapApiResponse, type ApiResponse } from '../../../shared/api/apiResponse'
import { httpClient } from '../../../shared/api/httpClient'

export interface HomeResponse {
  member: { loggedIn: boolean; id: number | null; name: string | null }
  popularCourses: CourseSummary[]
  latestCourses: CourseSummary[]
  latestInBody: { weightKg: number; skeletalMuscleMassKg: number; bodyFatPercentage: number; createdAt: string } | null
}

export async function getHome(): Promise<HomeResponse> {
  const response = await httpClient.get<ApiResponse<HomeResponse>>('/api/home')
  return unwrapApiResponse(response.data)
}
