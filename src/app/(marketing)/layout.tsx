import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'PipeFlow CRM — Gestão de vendas com pipeline visual',
  description:
    'Organize seus leads, acompanhe negócios no Kanban e feche mais vendas. Grátis para começar.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>
}
