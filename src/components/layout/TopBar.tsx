'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/pipeline': 'Pipeline',
  '/settings': 'Configurações',
}

function getPageTitle(pathname: string | null): string {
  if (!pathname) return 'PipeFlow'
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return title
    }
  }
  return 'PipeFlow'
}

interface TopBarProps {
  onMenuClick: () => void
  actions?: React.ReactNode
}

export function TopBar({ onMenuClick, actions }: TopBarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname ?? null)

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-800 bg-slate-900 px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <h1 className="text-lg font-semibold text-slate-100">{title}</h1>

      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  )
}
