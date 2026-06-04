'use client'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'
import { mockCurrentUser } from '@/mocks/workspaces'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import {
  Check,
  ChevronsUpDown,
  Kanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings2,
  Users,
  UserCircle,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/settings', label: 'Configurações', icon: Settings2 },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-950">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-sm">
            <Kanban className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">PipeFlow</span>
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className="shrink-0 border-b border-slate-800 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Selecionar workspace"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
                {getInitials(activeWorkspace.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">
                  {activeWorkspace.name}
                </p>
                <Badge
                  variant={activeWorkspace.plan === 'pro' ? 'default' : 'secondary'}
                  className="mt-0.5 h-4 px-1.5 text-[10px]"
                >
                  {activeWorkspace.plan === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-60 border-slate-700 bg-slate-900"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-slate-400">Workspaces</DropdownMenuLabel>
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onSelect={() => setActiveWorkspace(ws)}
                className="cursor-pointer text-slate-200 focus:bg-slate-800 focus:text-white"
              >
                <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-600 text-[10px] font-bold text-white">
                  {getInitials(ws.name)}
                </div>
                <span className="flex-1 truncate">{ws.name}</span>
                {ws.id === activeWorkspace.id && (
                  <Check className="ml-2 h-4 w-4 text-indigo-400" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="cursor-pointer text-slate-400 focus:bg-slate-800 focus:text-white">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Menu principal">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-slate-800 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Menu do usuário"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-indigo-700 text-xs font-semibold text-white">
                  {getInitials(mockCurrentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">
                  {mockCurrentUser.name}
                </p>
                <p className="truncate text-xs text-slate-500">{mockCurrentUser.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 border-slate-700 bg-slate-900"
            align="start"
            side="top"
            sideOffset={8}
          >
            <DropdownMenuItem className="cursor-pointer text-slate-200 focus:bg-slate-800 focus:text-white">
              <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Meu perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-slate-800 focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
