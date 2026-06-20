'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, CreditCard, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const SETTINGS_NAV = [
  { href: '/settings/workspace', label: 'Workspace', icon: Building2 },
  { href: '/settings/members', label: 'Membros', icon: Users },
  { href: '/settings/billing', label: 'Faturamento', icon: CreditCard },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col overflow-hidden md:flex-row">
      {/* Nav horizontal — mobile only */}
      <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-800 bg-slate-900/50 px-4 py-2 md:hidden">
        {SETTINGS_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sub-nav lateral — desktop */}
      <aside className="hidden w-52 shrink-0 border-r border-slate-800 bg-slate-900/50 md:flex md:flex-col">
        <div className="p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Configurações
          </p>
          <nav className="mt-3 space-y-0.5">
            {SETTINGS_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname?.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    active
                      ? 'bg-indigo-600/15 text-indigo-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
