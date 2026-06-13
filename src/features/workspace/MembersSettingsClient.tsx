'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Crown,
  Loader2,
  Mail,
  MoreHorizontal,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  useMemberCount,
  useRemoveMember,
  useRevokeInvite,
  useUpdateMemberRole,
  useWorkspaceInvites,
  useWorkspaceMembers,
} from '@/hooks/useWorkspaces'
import { useAuthStore } from '@/store/useAuthStore'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { MemberRole } from '@/types/supabase'
import type { WorkspaceMember } from '@/types/workspace'

// ── Invite modal ─────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email('E-mail inválido'),
  role: z.enum(['admin', 'member']),
})
type InviteForm = z.infer<typeof inviteSchema>

function InviteMemberModal({
  open,
  onClose,
  workspaceId,
  atLimit,
}: {
  open: boolean
  onClose: () => void
  workspaceId: string
  atLimit: boolean
}) {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'member' },
  })

  const roleValue = watch('role')

  async function onSubmit(data: InviteForm) {
    setServerError('')
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, workspaceId }),
    })

    const json = await res.json()

    if (!res.ok) {
      if (json.error === 'free_plan_limit') {
        setServerError(json.message)
      } else {
        setServerError(json.error ?? 'Erro ao enviar convite')
      }
      return
    }

    setSuccess(true)
    reset()
    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 1800)
  }

  function handleClose() {
    reset()
    setServerError('')
    setSuccess(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md border-slate-700 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Convidar membro</DialogTitle>
          <DialogDescription className="text-slate-400">
            O convite será enviado por e-mail e expira em 7 dias.
          </DialogDescription>
        </DialogHeader>

        {atLimit ? (
          <div className="rounded-lg border border-amber-800/50 bg-amber-950/30 p-4 text-sm text-amber-300">
            <p className="font-medium">Limite do plano Free atingido</p>
            <p className="mt-1 text-amber-400/70">
              O plano Free permite no máximo 2 membros. Faça upgrade para o plano Pro para
              convidar mais colaboradores.
            </p>
          </div>
        ) : success ? (
          <div className="rounded-lg border border-green-800/50 bg-green-950/30 p-4 text-sm text-green-300">
            Convite enviado com sucesso!
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email" className="text-slate-300">
                E-mail
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colaborador@empresa.com"
                className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role" className="text-slate-300">
                Papel
              </Label>
              <Select
                value={roleValue}
                onValueChange={(v) => setValue('role', v as MemberRole)}
              >
                <SelectTrigger
                  id="invite-role"
                  className="border-slate-600 bg-slate-700 text-slate-100 focus:ring-indigo-500"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-slate-100">
                  <SelectItem value="member">Membro — leitura e escrita em leads e negócios</SelectItem>
                  <SelectItem value="admin">Admin — acesso total + convidar membros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {serverError && <p className="text-xs text-red-400">{serverError}</p>}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-400">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                    Enviar convite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Role badge ───────────────────────────────────────────────

function RoleBadge({ role }: { role: MemberRole }) {
  return role === 'admin' ? (
    <Badge variant="default" className="gap-1 text-xs">
      <Crown className="h-3 w-3" aria-hidden="true" />
      Admin
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 text-xs">
      <Shield className="h-3 w-3" aria-hidden="true" />
      Membro
    </Badge>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// ── Member row ───────────────────────────────────────────────

function MemberRow({
  member,
  isCurrentUser,
  isAdmin,
}: {
  member: WorkspaceMember
  isCurrentUser: boolean
  isAdmin: boolean
}) {
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()
  const [removeOpen, setRemoveOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)

  const newRole = member.role === 'admin' ? 'member' : 'admin'
  const newRoleLabel = newRole === 'admin' ? 'Admin' : 'Membro'

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-indigo-700 text-xs font-semibold text-white">
          {getInitials(member.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">
          {member.name}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs text-slate-500">(você)</span>
          )}
        </p>
        <p className="truncate text-xs text-slate-500">{member.email}</p>
      </div>

      <RoleBadge role={member.role} />

      {isAdmin && !isCurrentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Ações do membro"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-slate-700 bg-slate-800"
          >
            <DropdownMenuItem
              className="cursor-pointer text-slate-200 focus:bg-slate-700"
              onSelect={() => setRoleOpen(true)}
            >
              <Crown className="mr-2 h-4 w-4" aria-hidden="true" />
              {member.role === 'admin' ? 'Tornar Membro' : 'Tornar Admin'}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              className="cursor-pointer text-red-400 focus:bg-slate-700 focus:text-red-400"
              onSelect={() => setRemoveOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ConfirmDialog
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        title={`Alterar papel de ${member.name}`}
        description={`Tem certeza que deseja tornar ${member.name} um ${newRoleLabel}?${newRole === 'admin' ? ' Ele terá acesso total ao workspace, incluindo convidar e remover membros.' : ''}`}
        confirmLabel="Confirmar"
        variant="default"
        onConfirm={() => updateRole.mutate({ userId: member.id, role: newRole })}
      />

      <ConfirmDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        title="Remover membro"
        description={`Tem certeza que deseja remover ${member.name} do workspace?`}
        confirmLabel="Remover"
        onConfirm={() => removeMember.mutate(member.id)}
      />
    </div>
  )
}

// ── Main component ───────────────────────────────────────────

export function MembersSettingsClient() {
  const { user } = useAuthStore()
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: members, isLoading: membersLoading } = useWorkspaceMembers()
  const { data: invites, isLoading: invitesLoading } = useWorkspaceInvites()
  const { data: memberCount } = useMemberCount()
  const revokeInvite = useRevokeInvite()

  const isFree = activeWorkspace?.plan === 'free'
  const atLimit = isFree && (memberCount ?? 0) >= 2

  const currentUserMember = members?.find((m) => m.id === user?.id)
  const isAdmin = currentUserMember?.role === 'admin'

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-indigo-400" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-bold text-slate-100">Membros</h2>
            <p className="text-sm text-slate-400">
              {memberCount ?? 0}
              {isFree ? ' / 2' : ''} membro{(memberCount ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => setInviteOpen(true)}
            disabled={atLimit}
            title={atLimit ? 'Limite do plano Free atingido' : undefined}
          >
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Convidar
          </Button>
        )}
      </div>

      {/* Aviso de limite */}
      {atLimit && isAdmin && (
        <div className="mb-5 rounded-lg border border-amber-800/50 bg-amber-950/30 p-3 text-sm text-amber-300">
          Você atingiu o limite de 2 membros do plano Free. Faça upgrade para Pro para adicionar mais colaboradores.
        </div>
      )}

      {/* Lista de membros */}
      <section className="mb-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Membros ativos
        </h3>
        {membersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {(members ?? []).map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isCurrentUser={member.id === user?.id}
                isAdmin={isAdmin ?? false}
              />
            ))}
          </div>
        )}
      </section>

      {/* Convites pendentes */}
      {isAdmin && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Convites pendentes
          </h3>
          {invitesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            </div>
          ) : !invites?.length ? (
            <p className="text-sm text-slate-600">Nenhum convite pendente.</p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3"
                >
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-300">{invite.email}</p>
                    <p className="text-xs text-slate-500">
                      Expira em{' '}
                      {new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      }).format(new Date(invite.expires_at))}
                    </p>
                  </div>
                  <RoleBadge role={invite.role} />
                  <button
                    type="button"
                    onClick={() => revokeInvite.mutate(invite.id)}
                    aria-label="Revogar convite"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-700 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeWorkspace && (
        <InviteMemberModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          workspaceId={activeWorkspace.id}
          atLimit={atLimit}
        />
      )}
    </div>
  )
}
