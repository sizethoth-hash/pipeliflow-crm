'use client'

import { useQuery } from '@tanstack/react-query'
import { getSubscription } from '@/services/billing'

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => getSubscription(),
    staleTime: 1000 * 60 * 5, // 5 min — plano muda raramente
  })
}
