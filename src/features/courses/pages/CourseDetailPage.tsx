import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, CalendarDays, CircleUserRound, MapPin, Trophy, WalletCards } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/apiError'
import { FavoriteButton } from '../../favorites/components/FavoriteButton'
import { getCourse } from '../api/courseApi'
import { formatFee, formatSchedule } from '../utils/formatCourse'
import styles from './CourseDetailPage.module.css'

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim())
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  if (!hasText(value)) return null
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailIcon}>{icon}</span>
      <div>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    </div>
  )
}

export function CourseDetailPage() {
  const { courseId } = useParams()
  const parsedId = Number(courseId)
  const validId = /^\d+$/.test(courseId ?? '') && Number.isSafeInteger(parsedId) && parsedId > 0
  const query = useQuery({
    queryKey: ['course', parsedId],
    queryFn: () => getCourse(parsedId),
    enabled: validId,
    retry: false,
  })

  if (!validId) {
    return <Recovery title="올바르지 않은 강좌 주소입니다." description="강좌 목록에서 다시 선택해주세요." />
  }

  if (query.isPending) {
    return <div className={styles.loading} aria-label="강좌 상세를 불러오는 중" />
  }

  if (query.isError) {
    if (query.error instanceof ApiError && (
      query.error.status === 404
      || query.error.errorCode === 'RESOURCE_NOT_FOUND'
      || query.error.errorCode === 'COURSE_NOT_FOUND'
    )) {
      return <Recovery title="강좌를 찾을 수 없습니다." description="삭제되었거나 더 이상 제공하지 않는 강좌일 수 있습니다." />
    }
    return (
      <div className={styles.error} role="alert">
        <h1>강좌 정보를 불러오지 못했습니다.</h1>
        <p>잠시 후 다시 시도해주세요.</p>
        <button type="button" onClick={() => query.refetch()}>다시 시도</button>
        <Link to="/courses">강좌 목록으로</Link>
      </div>
    )
  }

  const course = query.data
  const schedule = [course.weekdays, course.startTime, course.endTime].some(hasText)
    ? formatSchedule(course.weekdays, course.startTime, course.endTime)
    : null

  return (
    <article className={styles.page}>
      <Link className={styles.backLink} to="/courses"><ArrowLeft aria-hidden="true" size={18} />강좌 목록으로</Link>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div>
            {hasText(course.sportName) && <span className={styles.badge}>{course.sportName}</span>}
            <h1>{course.courseName}</h1>
            <p>{course.facilityName}</p>
          </div>
          <FavoriteButton courseId={course.courseId} />
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.mainCard} aria-labelledby="course-information">
          <h2 id="course-information">강좌 정보</h2>
          <dl className={styles.detailGrid}>
            <DetailItem icon={<Trophy aria-hidden="true" />} label="종목" value={course.sportName} />
            <DetailItem icon={<CircleUserRound aria-hidden="true" />} label="강사" value={course.instructorName} />
            <DetailItem icon={<CalendarDays aria-hidden="true" />} label="일정" value={schedule} />
            <DetailItem icon={<WalletCards aria-hidden="true" />} label="비용" value={formatFee(course.fee)} />
            <DetailItem icon={<Building2 aria-hidden="true" />} label="시설" value={course.facilityName} />
            <DetailItem icon={<MapPin aria-hidden="true" />} label="주소" value={course.address} />
          </dl>
        </section>

        {hasText(course.description) && (
          <section className={styles.description}>
            <h2>강좌 소개</h2>
            <p>{course.description}</p>
          </section>
        )}
      </div>
    </article>
  )
}

function Recovery({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.error}>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link to="/courses">강좌 목록으로</Link>
    </div>
  )
}
