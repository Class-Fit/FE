import { describe, expect, it } from 'vitest'
import { ApiError } from './apiError'
import { unwrapApiResponse } from './apiResponse'

describe('unwrapApiResponse', () => {
  it('unwraps_success_response', () => {
    expect(unwrapApiResponse({ success: true, data: { id: 7 }, errorCode: null, message: null })).toEqual({ id: 7 })
  })

  it('throws_api_error_for_unsuccessful_response', () => {
    expect(() => unwrapApiResponse({
      success: false,
      data: null,
      errorCode: 'COURSE_NOT_FOUND',
      message: '강좌를 찾을 수 없습니다.',
    })).toThrowError(new ApiError('COURSE_NOT_FOUND', '강좌를 찾을 수 없습니다.'))
  })
})

