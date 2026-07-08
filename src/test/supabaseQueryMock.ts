import { vi } from 'vitest'

/**
 * Cria um query builder encadeável que imita o formato fluente do
 * supabase-js (from().select().eq()...), resolvendo para { data, error, count }
 * quando aguardado (thenable) — evita depender de qual método é o "terminal".
 */
export function makeChainableQuery(result: {
  data?: unknown
  error?: { message: string } | null
  count?: number | null
}) {
  const resolved = { data: null, error: null, count: null, ...result }

  // Promise real com os métodos de encadeamento anexados — thenable sem
  // precisar declarar `.then` como propriedade solta (lint/suspicious/noThenProperty).
  const methods = {
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(() => Promise.resolve(resolved)),
  }
  const chain = Object.assign(Promise.resolve(resolved), methods)
  for (const key of Object.keys(methods) as (keyof typeof methods)[]) {
    if (key !== 'single') methods[key].mockReturnValue(chain)
  }

  return chain
}
