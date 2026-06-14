import Link from 'next/link'
import { Building2, CreditCard, Users } from 'lucide-react'

const SETTINGS_NAV = [
  { href: '/settings/workspace', label: 'Workspace', icon: Building2 },
  { href: '/settings/members', label: 'Membros', icon: Users },
  { href: '/settings/billing', label: 'Faturamento', icon: CreditCard },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Sub-nav lateral */}
      <aside className="hidden w-52 shrink-0 border-r border-slate-800 bg-slate-900/50 md:flex md:flex-col">
        <div className="p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Configurações
          </p>
          <nav className="mt-3 space-y-0.5">
            {SETTINGS_NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
