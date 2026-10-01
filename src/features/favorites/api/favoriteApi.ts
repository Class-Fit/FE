import { unwrapApiResponse, type ApiResponse } from '../../../shared/api/apiResponse'
import { httpClient } from '../../../shared/api/httpClient'
import type { CourseSummary } from '../../courses/api/courseTypes'
import type { FavoriteStatus } from './favoriteTypes'

export async function getFavorites(): Promise<CourseSummary[]> {
  const response = await httpClient.get<ApiResponse<CourseSummary[]>>('/api/members/me/favorites')
  return unwrapApiResponse(response.data)
}

export async function addFavorite(courseId: number): Promise<FavoriteStatus> {
  const response = await httpClient.post<ApiResponse<FavoriteStatus>>(`/api/courses/${courseId}/favorites`)
  return unwrapApiResponse(response.data)
}

export async function removeFavorite(courseId: number): Promise<FavoriteStatus> {
  const response = await httpClient.delete<ApiResponse<FavoriteStatus>>(`/api/courses/${courseId}/favorites`)
  return unwrapApiResponse(response.data)
}

