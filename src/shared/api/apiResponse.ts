import { ApiError } from './apiError'

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  errorCode: string | null
  message: string | null
}

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw new ApiError(
      response.errorCode ?? 'INVALID_API_RESPONSE',
      response.message ?? '요청을 처리하지 못했습니다.',
    )
  }

  return response.data
}

