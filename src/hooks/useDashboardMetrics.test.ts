import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { mockDeals } from '@/mocks/deals'
import { mockLeads } from '@/mocks/leads'
import { useDealsStore } from '@/store/useDealsStore'
import { useLeadsStore } from '@/store/useLeadsStore'
import { useDashboardMetrics } from './useDashboardMetrics'
import type { Deal } from '@/types/deal'

beforeEach(() => {
  useDealsStore.setState({ deals: [...mockDeals] })
  useLeadsStore.setState({ leads: [...mockLeads] })
})

describe('useDashboardMetrics', () => {
  describe('metrics.totalLeads', () => {
    it('conta todos os leads do store', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      expect(result.current.metrics.totalLeads).toBe(mockLeads.length)
    })

    it('retorna 0 quando não há leads', () => {
      useLeadsStore.setState({ leads: [] })
      const { result } = renderHook(() => useDashboardMetrics())
      expect(result.current.metrics.totalLeads).toBe(0)
    })
  })

  describe('metrics.openDeals', () => {
    it('conta apenas deals em etapas abertas (excluindo won e lost)', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      const expectedOpen = mockDeals.filter((d) =>
        ['new_lead', 'contacted', 'proposal', 'negotiation'].includes(d.stage)
      ).length
      expect(result.current.metrics.openDeals).toBe(expectedOpen)
    })

    it('retorna 0 quando só há deals fechados', () => {
      const closedOnly: Deal[] = mockDeals.filter((d) =>
        ['won', 'lost'].includes(d.stage)
      )
      useDealsStore.setState({ deals: closedOnly })
      const { result } = renderHook(() => useDashboardMetrics())
      expect(result.current.metrics.openDeals).toBe(0)
    })
  })

  describe('metrics.pipelineValue', () => {
    it('soma valores apenas dos deals abertos', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      const expected = mockDeals
        .filter((d) => ['new_lead', 'contacted', 'proposal', 'negotiation'].includes(d.stage))
        .reduce((sum, d) => sum + d.value, 0)
      expect(result.current.metrics.pipelineValue).toBe(expected)
    })

    it('retorna 0 quando pipeline está vazio', () => {
      useDealsStore.setState({ deals: [] })
      const { result } = renderHook(() => useDashboardMetrics())
      expect(result.current.metrics.pipelineValue).toBe(0)
    })
  })

  describe('metrics.conversionRate', () => {
    it('calcula taxa como won / (won + lost + open) * 100', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      const won = mockDeals.filter((d) => d.stage === 'won').length
      const total = mockDeals.length
      const expected = (won / total) * 100
      expect(result.current.metrics.conversionRate).toBeCloseTo(expected, 2)
    })

    it('retorna 0 quando não há deals', () => {
      useDealsStore.setState({ deals: [] })
      const { result } = renderHook(() => useDashboardMetrics())
      expect(result.current.metrics.conversionRate).toBe(0)
    })
  })

  describe('funnelData', () => {
    it('retorna exatamente 6 entradas (uma por etapa)', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      expect(result.current.funnelData).toHaveLength(6)
    })

    it('cada entrada contém stage, label, count, value e color', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      for (const entry of result.current.funnelData) {
        expect(entry).toHaveProperty('stage')
        expect(entry).toHaveProperty('label')
        expect(entry).toHaveProperty('count')
        expect(entry).toHaveProperty('value')
        expect(entry).toHaveProperty('color')
      }
    })

    it('count total do funil bate com total de deals', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      const totalCount = result.current.funnelData.reduce((sum, e) => sum + e.count, 0)
      expect(totalCount).toBe(mockDeals.length)
    })
  })

  describe('upcomingDeals', () => {
    it('retorna no máximo 5 deals', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      expect(result.current.upcomingDeals.length).toBeLessThanOrEqual(5)
    })

    it('contém apenas deals de etapas abertas', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      const closedStages = ['won', 'lost']
      for (const deal of result.current.upcomingDeals) {
        expect(closedStages).not.toContain(deal.stage)
      }
    })

    it('deals são ordenados por dueDate crescente', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      const dates = result.current.upcomingDeals
        .filter((d) => d.dueDate != null)
        .map((d) => new Date(d.dueDate!).getTime())
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1])
      }
    })
  })

  describe('recentLeads', () => {
    it('retorna no máximo 5 leads', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      expect(result.current.recentLeads.length).toBeLessThanOrEqual(5)
    })

    it('leads são ordenados por createdAt decrescente (mais recente primeiro)', () => {
      const { result } = renderHook(() => useDashboardMetrics())
      const dates = result.current.recentLeads.map((l) => new Date(l.createdAt).getTime())
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i - 1])
      }
    })
  })
})
