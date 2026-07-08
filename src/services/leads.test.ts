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

vi.mock('@/lib/supabase/server', () => ({
  getServerClient: vi.fn(),
}))

import { getServerClient } from '@/lib/supabase/server'
import { createLead, deleteLead, getLead, getLeads, updateLead } from './leads'

function mockSupabase(overrides: Record<string, unknown> = {}) {
  const tables: Record<string, unknown> = {
    leads: makeChainableQuery({ data: [mockLeadRow], count: 1 }),
    workspaces: makeChainableQuery({ data: { plan: 'free' } }),
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

describe('getLeads', () => {
  beforeEach(() => {
    mockSupabase()
  })

  it('mapeia linhas do banco para o tipo Lead', async () => {
    const result = await getLeads({ workspaceId: 'ws-1' })
    expect(result.leads).toHaveLength(1)
    expect(result.leads[0]).toMatchObject({ id: 'lead-1', name: 'Maria Silva' })
  })

  it('calcula totalPages com base em count e pageSize', async () => {
    mockSupabase({ leads: makeChainableQuery({ data: [mockLeadRow], count: 25 }) })
    const result = await getLeads({ workspaceId: 'ws-1', pageSize: 10 })
    expect(result.totalPages).toBe(3)
  })

  it('retorna totalPages mínimo de 1 quando não há resultados', async () => {
    mockSupabase({ leads: makeChainableQuery({ data: [], count: 0 }) })
    const result = await getLeads({ workspaceId: 'ws-1' })
    expect(result.totalPages).toBe(1)
    expect(result.leads).toHaveLength(0)
  })

  it('lança erro quando a query falha', async () => {
    mockSupabase({ leads: makeChainableQuery({ error: { message: 'boom' } }) })
    await expect(getLeads({ workspaceId: 'ws-1' })).rejects.toThrow('boom')
  })
})

describe('getLead', () => {
  it('retorna o lead mapeado quando encontrado', async () => {
    mockSupabase({ leads: makeChainableQuery({ data: mockLeadRow }) })
    const lead = await getLead('lead-1')
    expect(lead).toMatchObject({ id: 'lead-1', name: 'Maria Silva' })
  })

  it('retorna null quando a query falha (ex: não encontrado)', async () => {
    mockSupabase({ leads: makeChainableQuery({ error: { message: 'not found' } }) })
    const lead = await getLead('missing')
    expect(lead).toBeNull()
  })
})

describe('createLead', () => {
  it('cria lead normalmente quando abaixo do limite do plano free', async () => {
    mockSupabase({
      leads: makeChainableQuery({ data: mockLeadRow, count: 10 }),
    })
    const lead = await createLead({
      name: 'Maria Silva',
      email: 'maria@empresa.com',
      status: 'new',
    })
    expect(lead).toMatchObject({ id: 'lead-1' })
  })

  it('bloqueia criação ao atingir o limite de 50 leads no plano free', async () => {
    mockSupabase({
      leads: makeChainableQuery({ data: mockLeadRow, count: 50 }),
    })
    await expect(
      createLead({ name: 'Maria Silva', email: 'maria@empresa.com', status: 'new' })
    ).rejects.toThrow('LEAD_LIMIT_REACHED')
  })

  it('permite criação sem limite no plano pro', async () => {
    mockSupabase({
      workspaces: makeChainableQuery({ data: { plan: 'pro' } }),
      leads: makeChainableQuery({ data: mockLeadRow, count: 999 }),
    })
    const lead = await createLead({
      name: 'Maria Silva',
      email: 'maria@empresa.com',
      status: 'new',
    })
    expect(lead).toMatchObject({ id: 'lead-1' })
  })
})

describe('updateLead', () => {
  it('retorna o lead atualizado', async () => {
    mockSupabase({ leads: makeChainableQuery({ data: { ...mockLeadRow, name: 'Novo Nome' } }) })
    const lead = await updateLead('lead-1', { name: 'Novo Nome' })
    expect(lead.name).toBe('Novo Nome')
  })

  it('lança erro quando a atualização falha', async () => {
    mockSupabase({ leads: makeChainableQuery({ error: { message: 'update failed' } }) })
    await expect(updateLead('lead-1', { name: 'X' })).rejects.toThrow('update failed')
  })
})

describe('deleteLead', () => {
  it('completa sem erro quando a exclusão é bem-sucedida', async () => {
    mockSupabase({ leads: makeChainableQuery({ error: null }) })
    await expect(deleteLead('lead-1')).resolves.toBeUndefined()
  })

  it('lança erro quando a exclusão falha', async () => {
    mockSupabase({ leads: makeChainableQuery({ error: { message: 'delete failed' } }) })
    await expect(deleteLead('lead-1')).rejects.toThrow('delete failed')
  })
})
