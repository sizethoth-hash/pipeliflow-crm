import { Kanban } from 'lucide-react'

const STAGES = [
  'Novo Lead',
  'Contato Realizado',
  'Proposta Enviada',
  'Negociação',
  'Fechado Ganho',
  'Fechado Perdido',
]

export default function PipelinePage() {
  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Pipeline</h2>
          <p className="mt-1 text-sm text-slate-400">Visualize e mova seus negócios pelo funil</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          + Novo Negócio
        </button>
      </div>

      {/* Kanban columns preview */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="flex w-64 shrink-0 flex-col rounded-lg border border-slate-700/50 bg-slate-800/50 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {stage}
              </span>
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">0</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-700 py-10">
              <Kanban className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-slate-600">
        Drag-and-drop implementado no milestone M5
      </p>
    </div>
  )
}
