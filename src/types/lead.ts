export type LeadStatus = 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost'

export type ActivityType = 'call' | 'email' | 'meeting' | 'note'

export interface Lead {
  id: string
  workspaceId: string
  name: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  status: LeadStatus
  potentialValue?: number
  ownerId: string
  ownerName: string
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  leadId: string
  workspaceId: string
  type: ActivityType
  description: string
  authorId: string
  authorName: string
  createdAt: string
}

export interface LeadFilters {
  search: string
  status: LeadStatus | 'all'
  ownerId: string | 'all'
}
