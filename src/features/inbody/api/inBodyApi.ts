import { httpClient } from '../../../shared/api/httpClient'

export interface InBodyValues {
  heightCm: number
  weightKg: number
  bodyFatPercentage: number
  skeletalMuscleMassKg: number
  bodyFatMassKg: number
  bmi: number
}

export interface InBodyRecord extends InBodyValues {
  inBodyId: number
  createdAt: string
}

export async function analyzeInBody(image: File): Promise<InBodyValues> {
  const form = new FormData()
  form.append('image', image)
  const response = await httpClient.post<InBodyValues>('/api/inbodies/analyze', form)
  return response.data
}

export async function saveInBody(values: InBodyValues): Promise<InBodyRecord> {
  const response = await httpClient.post<InBodyRecord>('/api/inbodies', values)
  return response.data
}
