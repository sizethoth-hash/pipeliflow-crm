'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Kanban, Loader2, Shield, Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { MemberRole } from '@/types/supabase'

interface Props {
  token: string
  workspaceName: string
  inviteEmail: string
  role: MemberRole
}

export function AcceptInviteClient({ token, workspaceName, inviteEmail, role }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleAccept() {
    setStatus('loading')
    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMessage(json.error ?? 'Erro ao aceitar convite.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMessage('Erro de rede. Tente novamente.')
      setStatus('error')
    }
  }

  const roleLabel = role === 'admin' ? 'Administrador' : 'Membro'
  const RoleIcon = role === 'admin' ? Crown : Shield

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
            <Kanban className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        </div>

        {status === 'success' ? (
          <>
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-14 w-14 text-green-400" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-slate-100">Convite aceito!</h1>
            <p className="mb-8 text-sm text-slate-400">
              Você entrou no workspace <strong className="text-slate-200">"{workspaceName}"</strong> como{' '}
              <strong className="text-slate-200">{roleLabel}</strong>.
            </p>
            <Button className="w-full" onClick={() => router.push('/dashboard')}>
              Ir para o dashboard
            </Button>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-bold text-slate-100">Você foi convidado!</h1>
            <p className="mb-6 text-sm text-slate-400">
              Junte-se ao workspace <strong className="text-slate-200">"{workspaceName}"</strong>
            </p>

            {/* Detalhes do convite */}
            <div className="mb-6 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-slate-500 w-16 shrink-0">Email:</span>
                <span className="truncate">{inviteEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-slate-500 w-16 shrink-0">Papel:</span>
                <RoleIcon className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
                <span>{roleLabel}</span>
              </div>
            </div>

            {status === 'error' && (
              <p className="mb-4 text-sm text-red-400">{errorMessage}</p>
            )}

            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Aceitar convite'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
