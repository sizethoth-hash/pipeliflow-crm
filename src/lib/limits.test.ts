import { describe, expect, it } from 'vitest'
import { canAddLead, canAddMember, FREE_LIMITS } from './limits'

describe('canAddLead', () => {
  it('permite adicionar lead no plano free abaixo do limite', () => {
    expect(canAddLead('free', 0)).toBe(true)
    expect(canAddLead('free', FREE_LIMITS.leads - 1)).toBe(true)
  })

  it('bloqueia adicionar lead no plano free ao atingir o limite', () => {
    expect(canAddLead('free', FREE_LIMITS.leads)).toBe(false)
  })

  it('bloqueia adicionar lead no plano free acima do limite', () => {
    expect(canAddLead('free', FREE_LIMITS.leads + 10)).toBe(false)
  })

  it('sempre permite adicionar lead no plano pro, independente da contagem', () => {
    expect(canAddLead('pro', 0)).toBe(true)
    expect(canAddLead('pro', FREE_LIMITS.leads)).toBe(true)
    expect(canAddLead('pro', 10_000)).toBe(true)
  })
})

describe('canAddMember', () => {
  it('permite adicionar membro no plano free abaixo do limite', () => {
    expect(canAddMember('free', 0)).toBe(true)
    expect(canAddMember('free', FREE_LIMITS.members - 1)).toBe(true)
  })

  it('bloqueia adicionar membro no plano free ao atingir o limite', () => {
    expect(canAddMember('free', FREE_LIMITS.members)).toBe(false)
  })

  it('bloqueia adicionar membro no plano free acima do limite', () => {
    expect(canAddMember('free', FREE_LIMITS.members + 5)).toBe(false)
  })

  it('sempre permite adicionar membro no plano pro, independente da contagem', () => {
    expect(canAddMember('pro', 0)).toBe(true)
    expect(canAddMember('pro', FREE_LIMITS.members)).toBe(true)
    expect(canAddMember('pro', 500)).toBe(true)
  })
})
