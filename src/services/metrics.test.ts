import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeChainableQuery } from '@/test/supabaseQueryMock'

const mockLeadRow = {
  id: 'lead-1',
  workspace_id: 'ws-1',
  name: 'Maria Silva',
  email: 'maria@empresa.com',
  phone: null,
  company: null,
  job_title: null,
  status: 'new' as const,
  potential_value: null,
  notes: null,
  owner_id: 'user-1',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockDealRows = [
  {
    id: 'deal-1',
    workspace_id: 'ws-1',
    lead_id: 'lead-1',
    title: 'Negócio A',
    value: 1000,
    stage: 'new_lead' as const,
    owner_id: 'user-1',
    due_date: '2026-02-01T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'deal-2',
    workspace_id: 'ws-1',
    lead_id: 'lead-1',
    title: 'Negócio B',
    value: 2000,
    stage: 'won' as const,
    owner_id: 'user-1',
    due_date: null,
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'deal-3',
    workspace_id: 'ws-1',
    lead_id: 'lead-1',
    title: 'Negócio C',
    value: 500,
    stage: 'lost' as const,
    owner_id: 'user-1',
    due_date: null,
    created_at: '2026-01-03T00:00:00.000Z',
    updated_at: '2026-01-03T00:00:00.000Z',
  },
]

function makeQuery(data: unknown[]) {
  return makeChainableQuery({ data })
}

vi.mock('@/lib/supabase/server', () => ({
  getServerClient: vi.fn(),
}))

import { getServerClient } from '@/lib/supabase/server'
import { getDashboardData } from './metrics'

describe('getDashboardData', () => {
  beforeEach(() => {
    vi.mocked(getServerClient).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'leads') return makeQuery([mockLeadRow])
        return makeQuery(mockDealRows)
      }),
    } as never)
  })

  it('mapeia leads do banco para o tipo Lead da aplicação', async () => {
    const data = await getDashboardData('ws-1')
    expect(data.recentLeads).toHaveLength(1)
    expect(data.recentLeads[0]).toMatchObject({
      id: 'lead-1',
      name: 'Maria Silva',
      email: 'maria@empresa.com',
    })
  })

  it('conta apenas deals em etapas abertas para openDeals', () => {
    return getDashboardData('ws-1').then((data) => {
      expect(data.metrics.openDeals).toBe(1)
    })
  })

  it('soma o valor apenas dos deals abertos em pipelineValue', async () => {
    const data = await getDashboardData('ws-1')
    expect(data.metrics.pipelineValue).toBe(1000)
  })

  it('calcula conversionRate como won / (won + lost) * 100', async () => {
    const data = await getDashboardData('ws-1')
    expect(data.metrics.conversionRate).toBeCloseTo(50, 5)
  })

  it('inclui apenas deals abertos com dueDate em upcomingDeals', async () => {
    const data = await getDashboardData('ws-1')
    expect(data.upcomingDeals).toHaveLength(1)
    expect(data.upcomingDeals[0].id).toBe('deal-1')
  })

  it('lança erro quando a query de leads falha', async () => {
    vi.mocked(getServerClient).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'leads') {
          return makeChainableQuery({ error: { message: 'db error' } })
        }
        return makeQuery(mockDealRows)
      }),
    } as never)

    await expect(getDashboardData('ws-1')).rejects.toThrow('db error')
  })
})
