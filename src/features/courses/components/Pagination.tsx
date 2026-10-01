import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function pageRange(page: number, totalPages: number) {
  const start = Math.max(0, Math.min(page - 2, totalPages - 5))
  const end = Math.min(totalPages, start + 5)
  return Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index)
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className={styles.pagination} aria-label="검색 결과 페이지">
      <button type="button" onClick={() => onPageChange(0)} disabled={page === 0} aria-label="첫 페이지">«</button>
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 0} aria-label="이전 페이지">‹</button>
      {pageRange(page, totalPages).map((pageIndex) => (
        <button
          key={pageIndex}
          type="button"
          aria-label={`${pageIndex + 1}페이지`}
          aria-current={pageIndex === page ? 'page' : undefined}
          className={pageIndex === page ? styles.current : undefined}
          onClick={() => onPageChange(pageIndex)}
        >
          {pageIndex + 1}
        </button>
      ))}
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} aria-label="다음 페이지">›</button>
      <button type="button" onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1} aria-label="마지막 페이지">»</button>
    </nav>
  )
}

