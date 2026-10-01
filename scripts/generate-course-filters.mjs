import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const frontendRoot = resolve(import.meta.dirname, '..')
const backendDataRoot = resolve(frontendRoot, '../BE/src/main/resources/data')
const outputPath = resolve(frontendRoot, 'src/features/courses/data/filterOptions.ts')

async function readRows(fileName) {
  const source = await readFile(resolve(backendDataRoot, fileName), 'utf8')
  return source.trim().split(/\r?\n/).slice(1).map((line) => line.split(','))
}

const regionRows = await readRows('regions.csv')
const sportRows = await readRows('sports.csv')
const seenSportNames = new Set()

const regions = regionRows
  .filter(([code, name]) => code && name)
  .map(([value, label]) => ({ value, label }))

const sports = sportRows.flatMap(([value, label]) => {
  if (!value || !label || seenSportNames.has(label)) return []
  seenSportNames.add(label)
  return [{ value, label }]
})

const source = `// 백엔드 CSV에서 생성됩니다. 직접 수정하지 마세요.\n` +
  `export interface FilterOption { value: string; label: string }\n\n` +
  `export const REGION_OPTIONS: FilterOption[] = ${JSON.stringify([{ value: 'all', label: '전체' }, ...regions], null, 2)}\n\n` +
  `export const SPORT_OPTIONS: FilterOption[] = ${JSON.stringify([{ value: 'all', label: '전체' }, ...sports], null, 2)}\n`

await writeFile(outputPath, source)
console.log(`Generated ${regions.length} regions and ${sports.length} sports.`)
