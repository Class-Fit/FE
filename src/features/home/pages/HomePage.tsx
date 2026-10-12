import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Bot, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CourseCard } from '../../courses/components/CourseCard'
import type { CourseSummary } from '../../courses/api/courseTypes'
import { getHome } from '../api/homeApi'
import styles from './HomePage.module.css'

function CourseSection({ title, courses }: { title: string; courses: CourseSummary[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <h2>{title}</h2>
        <Link to="/courses">강좌 더 보기 <ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
      {courses.length ? (
        <div className={styles.courseGrid}>{courses.map((course) => <CourseCard key={course.courseId} course={course} />)}</div>
      ) : <p className={styles.empty}>등록된 강좌가 없습니다.</p>}
    </section>
  )
}

export function HomePage() {
  const query = useQuery({ queryKey: ['home'], queryFn: getHome })

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>CLASSFIT · PUBLIC SPORTS</span>
        <h1>ClassFit</h1>
        <p>{query.data?.member.loggedIn && query.data.member.name ? `${query.data.member.name}님, 오늘은 어떤 운동을 시작할까요?` : '내게 맞는 공공 체육 강좌를 찾아보세요.'}</p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} to="/courses"><Search aria-hidden="true" size={18} /> 강좌 찾기</Link>
          <Link className={styles.secondaryAction} to="/recommend"><Bot aria-hidden="true" size={18} /> AI 운동 추천</Link>
        </div>
      </section>

      {query.isPending && <p role="status">홈 정보를 불러오는 중입니다.</p>}
      {query.isError && <div className={styles.error} role="alert">홈 정보를 불러오지 못했습니다. <button type="button" onClick={() => query.refetch()}>다시 시도</button></div>}
      {query.data && <>
        {query.data.latestInBody && <section className={styles.inbody}>
          <h2>최근 인바디</h2>
          <p>체중 {query.data.latestInBody.weightKg}kg · 골격근량 {query.data.latestInBody.skeletalMuscleMassKg}kg · 체지방률 {query.data.latestInBody.bodyFatPercentage}%</p>
        </section>}
        <CourseSection title="인기 강좌" courses={query.data.popularCourses} />
        <CourseSection title="새로 등록된 강좌" courses={query.data.latestCourses} />
      </>}
    </div>
  )
}
