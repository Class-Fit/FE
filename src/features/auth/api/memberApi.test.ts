import { AxiosError, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../../../shared/api/httpClient'
import { getCurrentMember } from './memberApi'

const getMock = vi.spyOn(httpClient, 'get')

describe('memberApi', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('returns_null_only_for_unauthorized_response', async () => {
    getMock.mockRejectedValue(axiosError(401))
    await expect(getCurrentMember()).resolves.toBeNull()
  })

  it('rethrows_non_authentication_error', async () => {
    const error = axiosError(500)
    getMock.mockRejectedValue(error)
    await expect(getCurrentMember()).rejects.toBe(error)
  })
})

function axiosError(status: number) {
  const response = { status, statusText: String(status), headers: {}, config: {}, data: null } as AxiosResponse
  return new AxiosError('request failed', 'ERR_BAD_RESPONSE', undefined, undefined, response)
}
