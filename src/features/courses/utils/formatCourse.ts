export function formatFee(fee: number | null): string {
  if (fee === null) return '비용 문의'
  if (fee === 0) return '무료'
  return `${fee.toLocaleString('ko-KR')}원`
}

export function formatSchedule(
  weekdays: string | null,
  startTime: string | null,
  endTime: string | null,
): string {
  const days = weekdays?.trim() || null
  const start = startTime?.trim() || null
  const end = endTime?.trim() || null
  const time = start && end ? `${start}–${end}` : start ?? end

  return [days, time].filter(Boolean).join(' · ') || '일정 문의'
}

