import { Kanban, XCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getInviteByToken, type InviteWithWorkspace } from '@/services/workspaces'
import { AcceptInviteClient } from './AcceptInviteClient'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await getServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redireciona não autenticados antes de qualquer consulta ao banco
  if (!user) {
    redirect(`/login?redirect=/invite/${token}`)
  }

  // Valida o convite (somente para display — a mutação ocorre no client)
  const invite: InviteWithWorkspace | null = await getInviteByToken(token)

  const errorPage = (message: string) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
            <Kanban className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        </div>
        <div className="mb-4 flex justify-center">
          <XCircle className="h-14 w-14 text-red-400" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-100">Convite inválido</h1>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </div>
  )

  if (!invite) return errorPage('Este convite é inválido ou já expirou.')

  // Garante que o convite pertence ao usuário autenticado
  if (invite.email.toLowerCase() !== (user.email ?? '').toLowerCase()) {
    return errorPage('Este convite foi enviado para um endereço de e-mail diferente do seu.')
  }

  return (
    <AcceptInviteClient
      token={token}
      workspaceName={invite.workspaces.name}
      inviteEmail={invite.email}
      role={invite.role}
    />
  )
}
