import { create } from 'zustand'
import { mockActivities, mockLeads } from '@/mocks/leads'
import type { Activity, Lead, LeadFilters, LeadStatus } from '@/types/lead'

interface LeadsState {
  leads: Lead[]
  activities: Activity[]
  filters: LeadFilters
  currentPage: number
  pageSize: number

  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateLead: (id: string, data: Partial<Omit<Lead, 'id' | 'createdAt' | 'workspaceId'>>) => void
  deleteLead: (id: string) => void
  setFilters: (filters: Partial<LeadFilters>) => void
  resetFilters: () => void
  setPage: (page: number) => void

  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void
  deleteActivity: (id: string) => void

  getFilteredLeads: () => Lead[]
  getLeadById: (id: string) => Lead | undefined
  getActivitiesByLeadId: (leadId: string) => Activity[]
}

const DEFAULT_FILTERS: LeadFilters = {
  search: '',
  status: 'all',
  ownerId: 'all',
}

let leadIdCounter = mockLeads.length + 1
let activityIdCounter = mockActivities.length + 1

export const useLeadsStore = create<LeadsState>()((set, get) => ({
  leads: mockLeads,
  activities: mockActivities,
  filters: DEFAULT_FILTERS,
  currentPage: 1,
  pageSize: 10,

  addLead: (leadData) => {
    const now = new Date().toISOString()
    const newLead: Lead = {
      ...leadData,
      id: `lead-${leadIdCounter++}`,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ leads: [newLead, ...state.leads], currentPage: 1 }))
  },

  updateLead: (id, data) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, ...data, updatedAt: new Date().toISOString() } : lead
      ),
    }))
  },

  deleteLead: (id) => {
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
      activities: state.activities.filter((act) => act.leadId !== id),
    }))
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1,
    }))
  },

  resetFilters: () => set({ filters: DEFAULT_FILTERS, currentPage: 1 }),

  setPage: (page) => set({ currentPage: page }),

  addActivity: (activityData) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${activityIdCounter++}`,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ activities: [newActivity, ...state.activities] }))
  },

  deleteActivity: (id) => {
    set((state) => ({
      activities: state.activities.filter((act) => act.id !== id),
    }))
  },

  getFilteredLeads: () => {
    const { leads, filters } = get()
    return leads.filter((lead) => {
      const search = filters.search.toLowerCase()
      const matchesSearch =
        !search ||
        lead.name.toLowerCase().includes(search) ||
        (lead.company ?? '').toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search)

      const matchesStatus =
        filters.status === 'all' || lead.status === (filters.status as LeadStatus)
      const matchesOwner = filters.ownerId === 'all' || lead.ownerId === filters.ownerId

      return matchesSearch && matchesStatus && matchesOwner
    })
  },

  getLeadById: (id) => get().leads.find((l) => l.id === id),

  getActivitiesByLeadId: (leadId) =>
    get()
      .activities.filter((a) => a.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
}))
