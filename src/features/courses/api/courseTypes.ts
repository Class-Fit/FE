export interface CourseSummary {
  courseId: number
  courseName: string
  sportCode: string | null
  sportName: string | null
  facilityName: string
  address: string
  startTime: string | null
  endTime: string | null
  weekdays: string | null
  fee: number | null
}

export interface CourseDetail extends CourseSummary {
  instructorName: string | null
  description: string | null
  cityName: string | null
  localName: string | null
}

export interface CourseSearchParams {
  keyword?: string
  localCode?: string
  sportCode?: string
  page?: number
  size?: number
}

