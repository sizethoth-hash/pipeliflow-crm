import { beforeEach, describe, expect, it } from 'vitest'
import { mockDeals } from '@/mocks/deals'
import { useDealsStore } from './useDealsStore'

beforeEach(() => {
  useDealsStore.setState({ deals: [...mockDeals] })
})

describe('useDealsStore', () => {
  describe('getDealsByStage', () => {
    it('retorna apenas deals da etapa informada', () => {
      const { getDealsByStage } = useDealsStore.getState()
      const newLeads = getDealsByStage('new_lead')
      expect(newLeads.every((d) => d.stage === 'new_lead')).toBe(true)
    })

    it('retorna array vazio para etapa sem deals', () => {
      useDealsStore.setState({ deals: [] })
      const { getDealsByStage } = useDealsStore.getState()
      expect(getDealsByStage('won')).toHaveLength(0)
    })
  })

  describe('getDealById', () => {
    it('retorna o deal correto pelo id', () => {
      const { getDealById } = useDealsStore.getState()
      const deal = getDealById('deal-1')
      expect(deal).toBeDefined()
      expect(deal?.id).toBe('deal-1')
    })

    it('retorna undefined para id inexistente', () => {
      const { getDealById } = useDealsStore.getState()
      expect(getDealById('deal-999')).toBeUndefined()
    })
  })

  describe('moveDeal', () => {
    it('atualiza o stage do deal corretamente', () => {
      const { moveDeal } = useDealsStore.getState()
      moveDeal('deal-1', 'contacted')
      const updated = useDealsStore.getState().getDealById('deal-1')
      expect(updated?.stage).toBe('contacted')
    })

    it('atualiza o updatedAt ao mover', () => {
      const before = useDealsStore.getState().getDealById('deal-1')?.updatedAt
      useDealsStore.getState().moveDeal('deal-1', 'proposal')
      const after = useDealsStore.getState().getDealById('deal-1')?.updatedAt
      expect(after).not.toBe(before)
    })

    it('não afeta outros deals', () => {
      const countBefore = useDealsStore.getState().deals.length
      useDealsStore.getState().moveDeal('deal-1', 'won')
      expect(useDealsStore.getState().deals.length).toBe(countBefore)
    })
  })

  describe('addDeal', () => {
    it('adiciona um novo deal ao store', () => {
      const before = useDealsStore.getState().deals.length
      useDealsStore.getState().addDeal({
        workspaceId: 'ws-1',
        leadId: 'lead-5',
        leadName: 'Juliana Ferreira',
        title: 'Novo Negócio Teste',
        value: 5000,
        stage: 'new_lead',
        ownerId: 'user-1',
        ownerName: 'Sizenando Miguel',
      })
      expect(useDealsStore.getState().deals.length).toBe(before + 1)
    })

    it('novo deal fica no início do array', () => {
      useDealsStore.getState().addDeal({
        workspaceId: 'ws-1',
        leadId: 'lead-5',
        leadName: 'Juliana Ferreira',
        title: 'Deal Mais Recente',
        value: 1000,
        stage: 'contacted',
        ownerId: 'user-2',
        ownerName: 'Ana Lima',
      })
      expect(useDealsStore.getState().deals[0].title).toBe('Deal Mais Recente')
    })
  })

  describe('deleteDeal', () => {
    it('remove o deal correto', () => {
      const before = useDealsStore.getState().deals.length
      useDealsStore.getState().deleteDeal('deal-1')
      const state = useDealsStore.getState()
      expect(state.deals.length).toBe(before - 1)
      expect(state.getDealById('deal-1')).toBeUndefined()
    })

    it('não remove outros deals ao deletar um', () => {
      useDealsStore.getState().deleteDeal('deal-1')
      expect(useDealsStore.getState().getDealById('deal-2')).toBeDefined()
    })
  })

  describe('updateDeal', () => {
    it('atualiza campos do deal corretamente', () => {
      useDealsStore.getState().updateDeal('deal-1', { title: 'Título Atualizado', value: 99999 })
      const updated = useDealsStore.getState().getDealById('deal-1')
      expect(updated?.title).toBe('Título Atualizado')
      expect(updated?.value).toBe(99999)
    })

    it('preserva campos não alterados', () => {
      const original = useDealsStore.getState().getDealById('deal-1')
      useDealsStore.getState().updateDeal('deal-1', { title: 'Novo Título' })
      const updated = useDealsStore.getState().getDealById('deal-1')
      expect(updated?.leadId).toBe(original?.leadId)
      expect(updated?.ownerId).toBe(original?.ownerId)
    })
  })
})
