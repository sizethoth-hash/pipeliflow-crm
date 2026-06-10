'use client'

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { LeadFormModal } from '@/features/leads/LeadFormModal'
import { LeadStatusBadge } from '@/features/leads/LeadStatusBadge'
import { useDeleteLead, useLeads } from '@/hooks/useLeads'
import type { Lead, LeadFilters } from '@/types/lead'

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function LeadsPage() {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  const [filters, setFiltersState] = useState<Partial<LeadFilters>>({
    status: 'all',
  })
  const [page, setPage] = useState(1)

  const activeFilters: Partial<LeadFilters> = {
    ...filters,
    search: debouncedSearch || undefined,
  }

  const { data, isLoading, isError } = useLeads(activeFilters, page)
  const deleteMutation = useDeleteLead()

  const leads = data?.leads ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)

  const hasActiveFilters =
    (filters.status && filters.status !== 'all') || Boolean(debouncedSearch)

  const handleOpenCreate = useCallback(() => {
    setEditingLead(null)
    setFormOpen(true)
  }, [])

  const handleOpenEdit = useCallback((lead: Lead) => {
    setEditingLead(lead)
    setFormOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id)
    }
    setDeleteTarget(null)
  }, [deleteTarget, deleteMutation])

  function handleStatusChange(v: string) {
    setFiltersState((f) => ({ ...f, status: v as LeadFilters['status'] }))
    setPage(1)
  }

  function handleResetFilters() {
    setFiltersState({ status: 'all' })
    setSearchInput('')
    setPage(1)
  }

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Leads</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            {isLoading
              ? 'Carregando…'
              : `${total} ${total === 1 ? 'lead encontrado' : 'leads encontrados'}`}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="shrink-0">
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nome, empresa ou e-mail…"
            className="pl-9 border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
          <Select value={filters.status ?? 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-44 border-slate-600 bg-slate-700 text-slate-100 focus:ring-indigo-500">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-800 text-slate-100">
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="new">Novo Lead</SelectItem>
              <SelectItem value="contacted">Contato Realizado</SelectItem>
              <SelectItem value="proposal">Proposta Enviada</SelectItem>
              <SelectItem value="negotiation">Negociação</SelectItem>
              <SelectItem value="won">Fechado Ganho</SelectItem>
              <SelectItem value="lost">Fechado Perdido</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/40">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-sm text-red-400">
            Erro ao carregar leads. Tente novamente.
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <User className="h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-400">
              {hasActiveFilters
                ? 'Nenhum lead corresponde aos filtros'
                : 'Nenhum lead cadastrado ainda'}
            </p>
            {!hasActiveFilters && (
              <Button className="mt-4" size="sm" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Criar primeiro lead
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 font-medium text-slate-400">Nome</th>
                  <th className="hidden px-4 py-3 font-medium text-slate-400 sm:table-cell">
                    Empresa
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400">Status</th>
                  <th className="hidden px-4 py-3 font-medium text-slate-400 md:table-cell">
                    Responsável
                  </th>
                  <th className="hidden px-4 py-3 font-medium text-slate-400 lg:table-cell">
                    Criado em
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="group transition-colors hover:bg-slate-700/30">
                    <td className="px-4 py-3.5">
                      <Link href={`/leads/${lead.id}`} className="block">
                        <span className="font-medium text-slate-100 transition-colors group-hover:text-indigo-400">
                          {lead.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">{lead.email}</span>
                      </Link>
                    </td>

                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      {lead.company ? (
                        <>
                          <span className="text-slate-200">{lead.company}</span>
                          {lead.jobTitle && (
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {lead.jobTitle}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <LeadStatusBadge status={lead.status} />
                    </td>

                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(lead.ownerName || lead.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-slate-300">{lead.ownerName || '—'}</span>
                      </div>
                    </td>

                    <td className="hidden px-4 py-3.5 text-slate-400 lg:table-cell">
                      {formatDate(lead.createdAt)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(lead)}
                          aria-label={`Editar ${lead.name}`}
                          className="h-8 w-8 text-slate-400 hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(lead)}
                          aria-label={`Excluir ${lead.name}`}
                          className="h-8 w-8 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <LeadFormModal open={formOpen} onClose={() => setFormOpen(false)} lead={editingLead} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir lead"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita e todas as atividades vinculadas também serão removidas.`}
        confirmLabel="Excluir"
      />
    </div>
  )
}
