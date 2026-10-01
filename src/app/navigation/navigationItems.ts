import { Bot, Heart, Home, Search, ScanLine } from 'lucide-react'

export const NAVIGATION_ITEMS = [
  { label: '홈', to: '/', icon: Home },
  { label: '강좌 찾기', to: '/courses', icon: Search },
  { label: 'AI 운동 추천', to: '/recommend', icon: Bot },
  { label: '인바디', to: '/inbody', icon: ScanLine },
  { label: '찜', to: '/favorites', icon: Heart },
] as const

