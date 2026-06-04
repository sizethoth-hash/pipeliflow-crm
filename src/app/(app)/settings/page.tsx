import { Settings2 } from 'lucide-react'

const SETTING_SECTIONS = [
  { title: 'Workspace', description: 'Nome, logo e configurações gerais' },
  { title: 'Membros', description: 'Gerencie colaboradores e permissões' },
  { title: 'Plano & Cobrança', description: 'Upgrade, faturas e pagamentos' },
  { title: 'Notificações', description: 'Preferências de e-mail e alertas' },
]

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">Configurações</h2>
        <p className="mt-1 text-sm text-slate-400">Gerencie seu workspace e preferências</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SETTING_SECTIONS.map((section) => (
          <button
            key={section.title}
            type="button"
            className="flex items-start gap-4 rounded-lg border border-slate-700/50 bg-slate-800/50 p-5 text-left transition-colors hover:border-slate-600 hover:bg-slate-800"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-700">
              <Settings2 className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{section.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-slate-600">
        Configurações completas implementadas no milestone M11
      </p>
    </div>
  )
}
