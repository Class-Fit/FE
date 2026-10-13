export interface Member {
  id: number
  name: string
  email: string
  gender: 'MALE' | 'FEMALE' | null
  role: 'USER' | 'ADMIN'
}
