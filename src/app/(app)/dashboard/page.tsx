'use client'

import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
  const { currentUser } = useWorkspaceStore()
  const firstName = currentUser.name.split(' ')[0]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-slate-400 text-sm">Bem-vindo de volta, {firstName} 👋</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-100">Dashboard</h2>
      </div>

      {/* KPI cards placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total de Leads', value: '—' },
          { label: 'Negócios Abertos', value: '—' },
          { label: 'Valor do Pipeline', value: '—' },
          { label: 'Taxa de Conversão', value: '—' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-300">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Em breve */}
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 py-20 text-center">
        <LayoutDashboard className="h-10 w-10 text-slate-600" />
        <p className="mt-3 text-sm font-medium text-slate-400">
          Dashboard completo em breve
        </p>
        <p className="mt-1 text-xs text-slate-600">Implementado no milestone M7</p>
      </div>
    </div>
  )
}
