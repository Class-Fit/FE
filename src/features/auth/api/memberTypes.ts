export interface Member {
  id: number
  name: string
  email: string
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN'
  role: 'USER' | 'ADMIN'
}

