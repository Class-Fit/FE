import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateGender } from '../api/memberApi'
import type { Member } from '../api/memberTypes'
import styles from './GenderProfileCard.module.css'

type Gender = NonNullable<Member['gender']>

export function GenderProfileCard({ gender }: { gender: Member['gender'] }) {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Gender | ''>('')
  const save = useMutation({
    mutationFn: updateGender,
    onSuccess: (member) => {
      queryClient.setQueryData(['member'], member)
      setSelected('')
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selected && selected !== gender) save.mutate(selected)
  }

  return <section className={styles.card} aria-label="회원 성별 설정">
    <div>
      <h2>성별 정보</h2>
      <p>{gender ? `현재 성별: ${gender === 'MALE' ? '남성' : '여성'}` : '성별 정보가 없습니다. 맞춤 운동 추천을 위해 등록해 주세요.'}</p>
    </div>
    <form onSubmit={submit}>
      <label htmlFor="member-gender">성별</label>
      <select id="member-gender" value={selected} onChange={(event) => setSelected(event.target.value as Gender | '')} disabled={save.isPending}>
        <option value="">선택하세요</option>
        <option value="MALE">남성</option>
        <option value="FEMALE">여성</option>
      </select>
      <button type="submit" disabled={!selected || selected === gender || save.isPending}>{save.isPending ? '저장 중...' : '성별 저장'}</button>
    </form>
    {save.isSuccess && <p className={styles.success} role="status">성별을 저장했습니다.</p>}
    {save.isError && <p className={styles.error} role="alert">성별을 저장하지 못했습니다. 다시 시도해 주세요.</p>}
  </section>
}
