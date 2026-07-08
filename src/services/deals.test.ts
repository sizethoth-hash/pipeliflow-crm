import { describe, expect, it, vi } from 'vitest'
import { makeChainableQuery } from '@/test/supabaseQueryMock'

const mockDealRow = {
  id: 'deal-1',
  workspace_id: 'ws-1',
  lead_id: 'lead-1',
  title: 'Negócio A',
  value: 1000,
  stage: 'new_lead' as const,
  owner_id: 'user-1',
  due_date: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

vi.mock('@/lib/supabase/server', () => ({
  getServerClient: vi.fn(),
}))

import { getServerClient } from '@/lib/supabase/server'
import { createDeal, deleteDeal, getDeal, getDeals, moveDeal, updateDeal } from './deals'

function mockSupabase(overrides: Record<string, unknown> = {}) {
  const tables: Record<string, unknown> = {
    deals: makeChainableQuery({ data: [mockDealRow] }),
    workspace_members: makeChainableQuery({ data: { workspace_id: 'ws-1' } }),
    ...overrides,
  }

  vi.mocked(getServerClient).mockResolvedValue({
    from: vi.fn((table: string) => tables[table]),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
    },
  } as never)

  return tables
}

describe('getDeals', () => {
  it('mapeia linhas do banco para o tipo Deal', async () => {
    mockSupabase()
    const deals = await getDeals('ws-1')
    expect(deals).toHaveLength(1)
    expect(deals[0]).toMatchObject({ id: 'deal-1', title: 'Negócio A', value: 1000 })
  })

  it('lança erro quando a query falha', async () => {
    mockSupabase({ deals: makeChainableQuery({ error: { message: 'boom' } }) })
    await expect(getDeals('ws-1')).rejects.toThrow('boom')
  })
})

describe('getDeal', () => {
  it('retorna o deal mapeado quando encontrado', async () => {
    mockSupabase({ deals: makeChainableQuery({ data: mockDealRow }) })
    const deal = await getDeal('deal-1')
    expect(deal).toMatchObject({ id: 'deal-1' })
  })

  it('retorna null quando não encontrado', async () => {
    mockSupabase({ deals: makeChainableQuery({ error: { message: 'not found' } }) })
    const deal = await getDeal('missing')
    expect(deal).toBeNull()
  })
})

describe('createDeal', () => {
  it('cria o deal associando workspace e owner da sessão', async () => {
    mockSupabase({ deals: makeChainableQuery({ data: mockDealRow }) })
    const deal = await createDeal({ title: 'Negócio A', value: 1000, stage: 'new_lead' })
    expect(deal).toMatchObject({ id: 'deal-1' })
  })
})

describe('updateDeal', () => {
  it('atualiza e retorna o deal', async () => {
    mockSupabase({ deals: makeChainableQuery({ data: { ...mockDealRow, title: 'Novo Título' } }) })
    const deal = await updateDeal('deal-1', { title: 'Novo Título' })
    expect(deal.title).toBe('Novo Título')
  })

  it('remove leadName/ownerName do payload antes de persistir', async () => {
    const tables = mockSupabase({ deals: makeChainableQuery({ data: mockDealRow }) })
    await updateDeal('deal-1', { title: 'X', leadName: 'não deveria ir', ownerName: 'nem isso' })
    const dealsQuery = tables.deals as { update: (arg: unknown) => unknown }
    expect(dealsQuery.update).toHaveBeenCalledWith({ title: 'X' })
  })
})

describe('deleteDeal', () => {
  it('completa sem erro quando a exclusão é bem-sucedida', async () => {
    mockSupabase({ deals: makeChainableQuery({ error: null }) })
    await expect(deleteDeal('deal-1')).resolves.toBeUndefined()
  })

  it('lança erro quando a exclusão falha', async () => {
    mockSupabase({ deals: makeChainableQuery({ error: { message: 'delete failed' } }) })
    await expect(deleteDeal('deal-1')).rejects.toThrow('delete failed')
  })
})

describe('moveDeal', () => {
  it('atualiza apenas o stage do deal', async () => {
    const tables = mockSupabase({
      deals: makeChainableQuery({ data: { ...mockDealRow, stage: 'won' } }),
    })
    const deal = await moveDeal('deal-1', 'won')
    expect(deal.stage).toBe('won')
    const dealsQuery = tables.deals as { update: (arg: unknown) => unknown }
    expect(dealsQuery.update).toHaveBeenCalledWith({ stage: 'won' })
  })
})
