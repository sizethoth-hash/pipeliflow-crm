'use client'

import { Briefcase, DollarSign, Loader2, TrendingUp, Users } from 'lucide-react'
import { MetricCard } from '@/features/dashboard/MetricCard'
import { RecentLeads } from '@/features/dashboard/RecentLeads'
import { SalesFunnelChart } from '@/features/dashboard/SalesFunnelChart'
import { UpcomingDeals } from '@/features/dashboard/UpcomingDeals'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useAuthStore } from '@/store/useAuthStore'

function compactBRL(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useDashboardData()

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? 'Usuário'
  const firstName = fullName.split(' ')[0]

  const metrics = data?.metrics ?? {
    totalLeads: 0,
    openDeals: 0,
    pipelineValue: 0,
    conversionRate: 0,
  }
  const funnelData = data?.funnelData ?? []
  const upcomingDeals = data?.upcomingDeals ?? []
  const recentLeads = data?.recentLeads ?? []

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm">Bem-vindo de volta, {firstName} 👋</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-100">Dashboard</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <section aria-label="Métricas principais">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total de Leads"
                value={String(metrics.totalLeads)}
                icon={Users}
                iconColor="text-indigo-400"
              />
              <MetricCard
                label="Negócios Abertos"
                value={String(metrics.openDeals)}
                icon={Briefcase}
                iconColor="text-blue-400"
              />
              <MetricCard
                label="Valor do Pipeline"
                value={compactBRL(metrics.pipelineValue)}
                icon={DollarSign}
                iconColor="text-emerald-400"
              />
              <MetricCard
                label="Taxa de Conversão"
                value={`${metrics.conversionRate.toFixed(1)}%`}
                icon={TrendingUp}
                iconColor="text-amber-400"
              />
            </div>
          </section>

          {/* Funil + Negócios próximos */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SalesFunnelChart data={funnelData} />
            <UpcomingDeals deals={upcomingDeals} />
          </div>

          {/* Leads recentes */}
          <div className="mt-6">
            <RecentLeads leads={recentLeads} />
          </div>
        </>
      )}
    </div>
  )
}
