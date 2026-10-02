import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { REGION_OPTIONS, SPORT_OPTIONS } from '../data/filterOptions'
import styles from './CourseSearchForm.module.css'

export interface CourseFilterValues {
  keyword: string
  localCode: string
  sportCode: string
}

interface CourseSearchFormProps {
  values: CourseFilterValues
  onSearch: (values: CourseFilterValues) => void
}

export function CourseSearchForm({ values, onSearch }: CourseSearchFormProps) {
  const [draft, setDraft] = useState(values)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch({ ...draft, keyword: draft.keyword.trim() })
  }

  return (
    <form className={styles.form} role="search" onSubmit={submit}>
      <label className={styles.keywordField}>
        <span>강좌명 또는 시설명</span>
        <div className={styles.inputWrap}>
          <Search aria-hidden="true" size={19} />
          <input
            type="search"
            value={draft.keyword}
            placeholder="예: 수영, 국민체육센터"
            onChange={(event) => setDraft({ ...draft, keyword: event.target.value })}
          />
        </div>
      </label>

      <label>
        <span>지역</span>
        <select value={draft.localCode} onChange={(event) => setDraft({ ...draft, localCode: event.target.value })}>
          {REGION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <label>
        <span>종목</span>
        <select value={draft.sportCode} onChange={(event) => setDraft({ ...draft, sportCode: event.target.value })}>
          {SPORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <button type="submit">
        <Search aria-hidden="true" size={18} />
        검색
      </button>
    </form>
  )
}
