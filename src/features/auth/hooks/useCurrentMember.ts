import { useQuery } from '@tanstack/react-query'
import { getCurrentMember } from '../api/memberApi'

export function useCurrentMember() {
  return useQuery({
    queryKey: ['member'],
    queryFn: getCurrentMember,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

