'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useSubscription } from '@/hooks/useSubscription'
import { FREE_LIMITS } from '@/lib/limits'

const FREE_FEATURES = [
  `Até ${FREE_LIMITS.leads} leads`,
  `Até ${FREE_LIMITS.members} colaboradores`,
  'Pipeline Kanban',
  'Registro de atividades',
]

const PRO_FEATURES = [
  'Leads ilimitados',
  'Colaboradores ilimitados',
  'Pipeline Kanban',
  'Registro de atividades',
  'Suporte prioritário',
]

export function BillingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const { data: subscription, isLoading } = useSubscription()
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const isPro = activeWorkspace?.plan === 'pro'

  // Feedback após retorno do Stripe
  const success = searchParams?.get('success') === '1'
  const canceled = searchParams?.get('canceled') === '1'

  useEffect(() => {
    if (success || canceled) {
      router.replace('/settings/billing')
    }
  }, [success, canceled, router])

  async function handleUpgrade() {
    if (!activeWorkspace) return
    setCheckoutError(null)
    setIsRedirecting(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: activeWorkspace.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCheckoutError(data.error ?? 'Erro ao iniciar checkout')
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setCheckoutError('Erro de conexão. Tente novamente.')
    } finally {
      setIsRedirecting(false)
    }
  }

  async function handlePortal() {
    if (!activeWorkspace) return
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: activeWorkspace.id }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100">Faturamento</h1>
        <p className="mt-1 text-sm text-slate-400">Gerencie seu plano e assinatura.</p>
      </div>

      {/* Banner de feedback */}
      {success && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Upgrade realizado com sucesso! Seu workspace agora é Pro.
        </div>
      )}
      {canceled && (
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          Checkout cancelado. Seu plano não foi alterado.
        </div>
      )}

      {/* Plano atual */}
      <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Plano atual</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold text-slate-100">
                {isPro ? 'Pro' : 'Free'}
              </span>
              <Badge variant={isPro ? 'default' : 'secondary'}>
                {isPro ? 'Ativo' : 'Gratuito'}
              </Badge>
            </div>
            {subscription?.current_period_end && isPro && (
              <p className="mt-1 text-xs text-slate-500">
                Renova em {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                {subscription.cancel_at_period_end && ' · Cancela ao fim do período'}
              </p>
            )}
          </div>
          {isPro && (
            <Button variant="outline" size="sm" onClick={handlePortal} disabled={isLoading}>
              Gerenciar assinatura
            </Button>
          )}
        </div>
      </div>

      {/* Comparação de planos */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Free */}
        <div className={`rounded-xl border p-5 ${!isPro ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 bg-slate-800/40'}`}>
          <div className="mb-4">
            <p className="font-semibold text-slate-100">Free</p>
            <p className="mt-1 text-2xl font-bold text-slate-100">
              R$ 0<span className="text-sm font-normal text-slate-400">/mês</span>
            </p>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-slate-500" />
                {f}
              </li>
            ))}
          </ul>
          {!isPro && (
            <p className="mt-4 text-xs font-medium text-indigo-400">Plano atual</p>
          )}
        </div>

        {/* Pro */}
        <div className={`rounded-xl border p-5 ${isPro ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 bg-slate-800/40'}`}>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-100">Pro</p>
              <Badge variant="default" className="text-[10px]">
                <Zap className="mr-1 h-3 w-3" /> Recomendado
              </Badge>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-100">
              R$ 49<span className="text-sm font-normal text-slate-400">/mês</span>
            </p>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <p className="mt-4 text-xs font-medium text-indigo-400">Plano atual</p>
          ) : (
            <>
              <Button className="mt-4 w-full" onClick={handleUpgrade} disabled={isRedirecting}>
                <Zap className="mr-2 h-4 w-4" />
                {isRedirecting ? 'Redirecionando…' : 'Assinar Pro'}
              </Button>
              {checkoutError && (
                <p className="mt-2 text-xs text-red-400">{checkoutError}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
