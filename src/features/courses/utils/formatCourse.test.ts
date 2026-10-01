import { describe, expect, it } from 'vitest'
import { formatFee, formatSchedule } from './formatCourse'

describe('course display formatters', () => {
  it.each([
    [0, '무료'],
    [null, '비용 문의'],
    [35000, '35,000원'],
  ])('formats_fee_%s', (fee, expected) => {
    expect(formatFee(fee)).toBe(expected)
  })

  it('joins_only_present_schedule_values', () => {
    expect(formatSchedule('월, 수', '09:00', '10:30')).toBe('월, 수 · 09:00–10:30')
    expect(formatSchedule(null, '09:00', null)).toBe('09:00')
    expect(formatSchedule('', null, null)).toBe('일정 문의')
  })
})

