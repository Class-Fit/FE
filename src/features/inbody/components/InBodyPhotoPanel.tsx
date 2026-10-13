import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera } from 'lucide-react'
import { analyzeInBody, saveInBody, type InBodyRecord, type InBodyValues } from '../api/inBodyApi'
import styles from './InBodyPhotoPanel.module.css'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const FIELDS = [
  { key: 'heightCm', label: '키 (cm)', max: 300 },
  { key: 'weightKg', label: '체중 (kg)', max: 300 },
  { key: 'bodyFatPercentage', label: '체지방률 (%)', max: 100 },
  { key: 'skeletalMuscleMassKg', label: '골격근량 (kg)', max: 100 },
  { key: 'bodyFatMassKg', label: '체지방량 (kg)', max: 300 },
  { key: 'bmi', label: 'BMI', max: 100 },
] as const
type Field = keyof InBodyValues

interface Props {
  onSaved: (record: InBodyRecord) => Promise<void>
  saveLabel?: string
  successMessage?: string
  retryLabel?: string
}

function toInputValues(values: InBodyValues): Record<Field, string> {
  return Object.fromEntries(FIELDS.map(({ key }) => [key, values[key] == null ? '' : String(values[key])])) as Record<Field, string>
}

function parseValues(inputs: Record<Field, string>): InBodyValues | null {
  const values: Partial<InBodyValues> = {}
  for (const { key, max } of FIELDS) {
    const input = inputs[key].trim()
    const value = Number(input)
    if (!input || !Number.isFinite(value) || value <= 0 || value > max) return null
    values[key] = value
  }
  return values as InBodyValues
}

export function InBodyPhotoPanel({ onSaved, saveLabel = '저장하고 추천받기', successMessage = '인바디 기록을 저장하고 추천을 요청했습니다.', retryLabel = '저장된 기록으로 다시 추천받기' }: Props) {
  const [image, setImage] = useState<File | null>(null)
  const [inputs, setInputs] = useState<Record<Field, string> | null>(null)
  const [busy, setBusy] = useState<'analyzing' | 'saving' | 'recommending' | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<InBodyRecord | null>(null)
  const [complete, setComplete] = useState(false)
  const invalidImage = image !== null && (!['image/jpeg', 'image/png'].includes(image.type) || image.size > MAX_IMAGE_BYTES)

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImage(file)
    setInputs(null)
    setSaved(null)
    setComplete(false)
    setError('')
    if (file && !['image/jpeg', 'image/png'].includes(file.type)) setError('JPG 또는 PNG 사진을 선택해 주세요.')
    else if (file && file.size > MAX_IMAGE_BYTES) setError('사진은 10MB 이하로 선택해 주세요.')
  }

  async function analyze() {
    if (!image || invalidImage || busy) return
    setBusy('analyzing')
    setError('')
    try {
      setInputs(toInputValues(await analyzeInBody(image)))
      setError('')
    } catch {
      setError('사진을 분석하지 못했습니다. 선명한 인바디 사진으로 다시 시도해 주세요.')
    } finally {
      setBusy(null)
    }
  }

  async function recommend(record: InBodyRecord) {
    setBusy('recommending')
    try {
      await onSaved(record)
      setComplete(true)
      setError('')
    } catch {
      setError('인바디 기록은 저장됐지만 추천 요청에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setBusy(null)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!inputs || busy) return
    const values = parseValues(inputs)
    if (!values) {
      setError('모든 수치를 확인해 입력해 주세요. 0보다 큰 숫자여야 합니다.')
      return
    }
    setBusy('saving')
    setError('')
    let record: InBodyRecord
    try {
      record = await saveInBody(values)
      setSaved(record)
    } catch {
      setError('인바디 기록을 저장하지 못했습니다. 다시 시도해 주세요.')
      setBusy(null)
      return
    }
    setBusy(null)
    await recommend(record)
  }

  return <section className={styles.panel} aria-label="인바디 사진 분석">
    <div className={styles.heading}><Camera aria-hidden="true" size={23} /><div><h2>인바디 사진으로 추천받기</h2><p>사진의 수치를 추출한 뒤 확인하고 저장해 주세요.</p></div></div>
    <p className={styles.note}>사진은 수치 분석을 위해 AI 서비스로 전송됩니다. 원본 사진은 저장하지 않고 확인한 수치만 저장합니다.</p>
    <label className={styles.fileLabel} htmlFor="inbody-image">인바디 사진</label>
    <input id="inbody-image" type="file" accept="image/jpeg,image/png" onChange={selectImage} disabled={busy !== null} />
    {image && <p className={styles.fileName}>선택한 사진: {image.name}</p>}
    <button className={styles.action} type="button" onClick={analyze} disabled={!image || invalidImage || busy !== null}>{busy === 'analyzing' ? '사진 분석 중...' : '사진 분석하기'}</button>
    {inputs && !saved && <form onSubmit={submit}>
      <p className={styles.note}>추출 결과가 틀릴 수 있습니다. 원본 사진과 비교하고 수정해 주세요.</p>
      <div className={styles.fields}>{FIELDS.map(({ key, label, max }) => <label key={key}>{label}
        <input type="number" inputMode="decimal" min="0.01" max={max} step="any" value={inputs[key]} onChange={(event) => { setInputs({ ...inputs, [key]: event.target.value }); setError('') }} required />
      </label>)}</div>
      <button className={styles.action} type="submit" disabled={busy !== null}>{busy === 'saving' ? '저장 중...' : saveLabel}</button>
    </form>}
    {saved && !complete && <button className={styles.action} type="button" onClick={() => recommend(saved)} disabled={busy !== null}>{busy === 'recommending' ? '요청 처리 중...' : retryLabel}</button>}
    {complete && <p className={styles.success} role="status">{successMessage}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
  </section>
}
