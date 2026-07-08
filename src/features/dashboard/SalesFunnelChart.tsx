'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FunnelData } from '@/types/dashboard'

interface SalesFunnelChartProps {
  data: FunnelData[]
}

interface TooltipPayloadItem {
  payload: FunnelData
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-200">{item.label}</p>
      <p className="mt-1 text-slate-400">
        {item.count} {item.count === 1 ? 'negócio' : 'negócios'}
      </p>
      <p className="text-slate-400">
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 0,
        }).format(item.value)}
      </p>
    </div>
  )
}

export function SalesFunnelChart({ data }: SalesFunnelChartProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-200">Negócios por Etapa</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={128}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.stage} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
