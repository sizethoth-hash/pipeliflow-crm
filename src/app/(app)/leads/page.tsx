import { Users } from 'lucide-react'

export default function LeadsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Leads</h2>
          <p className="mt-1 text-sm text-slate-400">Gerencie seus contatos e oportunidades</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          + Novo Lead
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 py-20 text-center">
        <Users className="h-10 w-10 text-slate-600" />
        <p className="mt-3 text-sm font-medium text-slate-400">Nenhum lead cadastrado ainda</p>
        <p className="mt-1 text-xs text-slate-600">Implementado no milestone M4</p>
      </div>
    </div>
  )
}
