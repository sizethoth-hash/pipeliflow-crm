import type { PlanType } from '@/types/supabase'

export const FREE_LIMITS = {
  leads: 50,
  members: 2,
} as const

export function canAddLead(plan: PlanType, currentLeadCount: number): boolean {
  if (plan === 'pro') return true
  return currentLeadCount < FREE_LIMITS.leads
}

export function canAddMember(plan: PlanType, currentMemberCount: number): boolean {
  if (plan === 'pro') return true
  return currentMemberCount < FREE_LIMITS.members
}
