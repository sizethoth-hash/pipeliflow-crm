import { Badge } from '@/components/ui/Badge'
import type { LeadStatus } from '@/types/lead'

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'outline' | 'warning' }
> = {
  new: { label: 'Novo Lead', variant: 'secondary' },
  contacted: { label: 'Contato Realizado', variant: 'default' },
  proposal: { label: 'Proposta Enviada', variant: 'warning' },
  negotiation: { label: 'Negociação', variant: 'default' },
  won: { label: 'Fechado Ganho', variant: 'success' },
  lost: { label: 'Fechado Perdido', variant: 'destructive' },
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

export { STATUS_CONFIG }
