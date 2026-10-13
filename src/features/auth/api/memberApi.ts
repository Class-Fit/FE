import { unwrapApiResponse, type ApiResponse } from '../../../shared/api/apiResponse'
import { ApiError } from '../../../shared/api/apiError'
import { httpClient } from '../../../shared/api/httpClient'
import type { Member } from './memberTypes'

export async function getCurrentMember(): Promise<Member | null> {
  try {
    const response = await httpClient.get<ApiResponse<Member>>('/api/members/me')
    return unwrapApiResponse(response.data)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    if (isUnauthorizedAxiosError(error)) return null
    throw error
  }
}

export async function logout(): Promise<void> {
  const token = await getCsrfToken()
  await httpClient.post('/api/auth/logout', undefined, { headers: { 'X-CSRF-TOKEN': token } })
}

export async function updateGender(gender: NonNullable<Member['gender']>): Promise<Member> {
  const token = await getCsrfToken()
  const response = await httpClient.patch<ApiResponse<Member>>('/api/members/me/gender', { gender }, {
    headers: { 'X-CSRF-TOKEN': token },
  })
  return unwrapApiResponse(response.data)
}

async function getCsrfToken(): Promise<string> {
  const response = await httpClient.get<ApiResponse<{ token: string }>>('/api/auth/csrf')
  const { token } = unwrapApiResponse(response.data)
  return token
}

function isUnauthorizedAxiosError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { isAxiosError?: boolean; response?: { status?: number } }
  return candidate.isAxiosError === true && candidate.response?.status === 401
}
