import { create } from 'zustand'
import { mockDeals } from '@/mocks/deals'
import type { Deal, DealStage } from '@/types/deal'

interface DealsState {
  deals: Deal[]

  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDeal: (id: string, data: Partial<Omit<Deal, 'id' | 'createdAt' | 'workspaceId'>>) => void
  deleteDeal: (id: string) => void
  moveDeal: (id: string, newStage: DealStage) => void

  getDealsByStage: (stage: DealStage) => Deal[]
  getDealById: (id: string) => Deal | undefined
}

let dealIdCounter = mockDeals.length + 1

export const useDealsStore = create<DealsState>()((set, get) => ({
  deals: mockDeals,

  addDeal: (dealData) => {
    const now = new Date().toISOString()
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${dealIdCounter++}`,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ deals: [newDeal, ...state.deals] }))
  },

  updateDeal: (id, data) => {
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === id ? { ...deal, ...data, updatedAt: new Date().toISOString() } : deal
      ),
    }))
  },

  deleteDeal: (id) => {
    set((state) => ({
      deals: state.deals.filter((deal) => deal.id !== id),
    }))
  },

  moveDeal: (id, newStage) => {
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === id ? { ...deal, stage: newStage, updatedAt: new Date().toISOString() } : deal
      ),
    }))
  },

  getDealsByStage: (stage) => get().deals.filter((d) => d.stage === stage),

  getDealById: (id) => get().deals.find((d) => d.id === id),
}))
