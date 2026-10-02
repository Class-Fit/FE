import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getCourses } from '../api/courseApi'
import type { CourseSearchParams } from '../api/courseTypes'
import { CourseCard } from '../components/CourseCard'
import { CourseSearchForm, type CourseFilterValues } from '../components/CourseSearchForm'
import { Pagination } from '../components/Pagination'
import styles from './CourseSearchPage.module.css'

function normalizePage(value: string | null) {
  if (value === null || !/^\d+$/.test(value)) return 0
  const page = Number(value)
  return Number.isSafeInteger(page) ? page : 0
}

function meaningful(value: string | null) {
  const normalized = value?.trim()
  return normalized && normalized !== 'all' ? normalized : undefined
}

export function CourseSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo<CourseSearchParams>(() => ({
    ...(meaningful(searchParams.get('keyword')) && { keyword: meaningful(searchParams.get('keyword')) }),
    ...(meaningful(searchParams.get('localCode')) && { localCode: meaningful(searchParams.get('localCode')) }),
    ...(meaningful(searchParams.get('sportCode')) && { sportCode: meaningful(searchParams.get('sportCode')) }),
    page: normalizePage(searchParams.get('page')),
  }), [searchParams])

  const formValues = useMemo<CourseFilterValues>(() => ({
    keyword: searchParams.get('keyword') ?? '',
    localCode: searchParams.get('localCode') ?? 'all',
    sportCode: searchParams.get('sportCode') ?? 'all',
  }), [searchParams])
  const query = useQuery({ queryKey: ['courses', params], queryFn: () => getCourses(params) })

  function applyFilters(values: CourseFilterValues) {
    const next = new URLSearchParams()
    if (values.keyword) next.set('keyword', values.keyword)
    if (values.localCode !== 'all') next.set('localCode', values.localCode)
    if (values.sportCode !== 'all') next.set('sportCode', values.sportCode)
    setSearchParams(next)
  }

  function changePage(page: number) {
    const next = new URLSearchParams(searchParams)
    if (page === 0) next.delete('page')
    else next.set('page', String(page))
    setSearchParams(next)
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <span>PUBLIC SPORTS CLASS</span>
        <h1>내 생활에 맞는 강좌를 찾아보세요</h1>
        <p>지역 공공 체육시설의 강좌를 종목과 지역으로 한 번에 검색할 수 있어요.</p>
      </header>

      <CourseSearchForm
        key={`${formValues.keyword}:${formValues.localCode}:${formValues.sportCode}`}
        values={formValues}
        onSearch={applyFilters}
      />

      {query.isPending && <div className={styles.skeletonGrid} aria-label="강좌를 불러오는 중">{Array.from({ length: 6 }, (_, i) => <div key={i} />)}</div>}

      {query.isError && (
        <div className={styles.state} role="alert">
          <h2>강좌를 불러오지 못했습니다.</h2>
          <p>잠시 후 다시 시도해주세요.</p>
          <button type="button" onClick={() => query.refetch()}>다시 시도</button>
        </div>
      )}

      {query.data && (
        <div className={styles.results}>
          <div className={styles.resultHeader}>
            <h2>검색 결과</h2>
            <p>총 {query.data.totalCount.toLocaleString('ko-KR')}개의 강좌</p>
          </div>

          {query.data.content.length === 0 ? (
            <div className={styles.state}>
              <SearchX aria-hidden="true" size={38} />
              <h2>조건에 맞는 강좌가 없습니다.</h2>
              <p>검색어나 필터를 바꿔 다시 찾아보세요.</p>
            </div>
          ) : (
            <div className={styles.courseGrid}>
              {query.data.content.map((course) => <CourseCard key={course.courseId} course={course} />)}
            </div>
          )}

          <Pagination page={query.data.page} totalPages={query.data.totalPages} onPageChange={changePage} />
        </div>
      )}
    </section>
  )
}
