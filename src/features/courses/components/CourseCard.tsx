import type { ReactNode } from 'react'
import { Building2, CalendarDays, Dumbbell, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CourseSummary } from '../api/courseTypes'
import { formatFee, formatSchedule } from '../utils/formatCourse'
import styles from './CourseCard.module.css'

interface CourseCardProps {
  course: CourseSummary
  favoriteAction?: ReactNode
}

export function CourseCard({ course, favoriteAction }: CourseCardProps) {
  return (
    <article className={styles.card} data-sport-code={course.sportCode ?? 'unknown'}>
      <div className={styles.visual}>
        <Dumbbell aria-hidden="true" size={30} />
        <span>{course.sportName || '생활체육'}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <Link className={styles.title} to={`/courses/${course.courseId}`}>
            {course.courseName}
          </Link>
          {favoriteAction}
        </div>

        <dl className={styles.details}>
          <div>
            <Building2 aria-hidden="true" size={17} />
            <dt className={styles.srOnly}>시설</dt>
            <dd>{course.facilityName}</dd>
          </div>
          <div>
            <MapPin aria-hidden="true" size={17} />
            <dt className={styles.srOnly}>주소</dt>
            <dd>{course.address}</dd>
          </div>
          <div>
            <CalendarDays aria-hidden="true" size={17} />
            <dt className={styles.srOnly}>일정</dt>
            <dd>{formatSchedule(course.weekdays, course.startTime, course.endTime)}</dd>
          </div>
        </dl>

        <strong className={styles.fee}>{formatFee(course.fee)}</strong>
      </div>
    </article>
  )
}

