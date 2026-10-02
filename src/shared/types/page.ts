export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalCount: number
  totalPages: number
  first: boolean
  last: boolean
}

