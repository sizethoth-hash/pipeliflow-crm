import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Kanban } from 'lucide-react'
import { getServerClient } from '@/lib/supabase/server'
import { acceptInvite, getInviteByToken, type InviteWithWorkspace } from '@/services/workspaces'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await getServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verifica se o convite é válido
  const invite: InviteWithWorkspace | null = await getInviteByToken(token)

  if (!invite) {
    return <InviteResult ok={false} message="Este convite é inválido ou já expirou." />
  }

  // Usuário não autenticado — redireciona para login com redirect de volta
  if (!user) {
    redirect(`/login?redirect=/invite/${token}`)
  }

  // Aceita o convite via RPC
  try {
    await acceptInvite(token)
    return (
      <InviteResult
        ok={true}
        message="Você entrou no workspace com sucesso!"
        workspaceName={invite.workspaces.name}
      />
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao aceitar convite.'
    return <InviteResult ok={false} message={message} />
  }
}

function InviteResult({
  ok,
  message,
  workspaceName,
}: {
  ok: boolean
  message: string
  workspaceName?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
            <Kanban className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        </div>

        {/* Ícone de resultado */}
        <div className="mb-4 flex justify-center">
          {ok ? (
            <CheckCircle className="h-14 w-14 text-green-400" aria-hidden="true" />
          ) : (
            <XCircle className="h-14 w-14 text-red-400" aria-hidden="true" />
          )}
        </div>

        <h1 className="mb-2 text-xl font-bold text-slate-100">
          {ok ? 'Convite aceito!' : 'Convite inválido'}
        </h1>

        {workspaceName && (
          <p className="mb-1 text-sm font-medium text-indigo-400">"{workspaceName}"</p>
        )}

        <p className="mb-8 text-sm text-slate-400">{message}</p>

        {ok ? (
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Ir para o dashboard
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Voltar ao início
          </Link>
        )}
      </div>
    </div>
  )
}
