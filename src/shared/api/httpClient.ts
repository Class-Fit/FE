import axios from 'axios'
import { ApiError } from './apiError'
import type { ApiResponse } from './apiResponse'
import { backendOrigin } from './backendOrigin'

export const httpClient = axios.create({
  baseURL: backendOrigin || '/',
  withCredentials: true,
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
      const response = error.response
      const body = response?.data

      if (body?.success === false && body.errorCode && body.message) {
        return Promise.reject(new ApiError(body.errorCode, body.message, response?.status))
      }
    }

    return Promise.reject(error)
  },
)
