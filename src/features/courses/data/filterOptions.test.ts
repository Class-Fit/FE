import { describe, expect, it } from 'vitest'
import { REGION_OPTIONS, SPORT_OPTIONS } from './filterOptions'

describe('course filter options', () => {
  it('excludes_province_codes_that_backend_cannot_expand', () => {
    expect(REGION_OPTIONS).not.toContainEqual({ value: '11000', label: '서울특별시' })
    expect(REGION_OPTIONS).toContainEqual({ value: '11110', label: '서울특별시 종로구' })
    expect(REGION_OPTIONS).toContainEqual({ value: '36110', label: '세종특별자치시' })
  })

  it('keeps_every_duplicate_sport_code_for_exact_backend_search', () => {
    expect(SPORT_OPTIONS).toContainEqual({ value: '79', label: '필라테스 (79)' })
    expect(SPORT_OPTIONS).toContainEqual({ value: '106', label: '필라테스 (106)' })
    expect(SPORT_OPTIONS).toContainEqual({ value: '22', label: '태권도 (22)' })
    expect(SPORT_OPTIONS).toContainEqual({ value: '96', label: '태권도 (96)' })
  })
})

