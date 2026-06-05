export type DealStage = 'new_lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Deal {
  id: string
  workspaceId: string
  leadId: string
  leadName: string
  title: string
  value: number
  stage: DealStage
  ownerId: string
  ownerName: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface PipelineColumn {
  id: DealStage
  label: string
  accentColor: string
}

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'new_lead', label: 'Novo Lead', accentColor: '#3b82f6' },
  { id: 'contacted', label: 'Contato Realizado', accentColor: '#22c55e' },
  { id: 'proposal', label: 'Proposta Enviada', accentColor: '#f59e0b' },
  { id: 'negotiation', label: 'Negociação', accentColor: '#f97316' },
  { id: 'won', label: 'Fechado Ganho', accentColor: '#10b981' },
  { id: 'lost', label: 'Fechado Perdido', accentColor: '#ef4444' },
]
