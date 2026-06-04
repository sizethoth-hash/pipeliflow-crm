'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

const workspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(50, 'Nome muito longo'),
})

type WorkspaceFormData = z.infer<typeof workspaceSchema>

type Step = 'create' | 'confirm'

export default function OnboardingPage() {
  const { loading, error, createWorkspaceAndContinue } = useAuth()
  const [step, setStep] = useState<Step>('create')
  const [workspaceName, setWorkspaceName] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
  })

  function onWorkspaceSubmit(data: WorkspaceFormData) {
    setWorkspaceName(data.workspaceName)
    setStep('confirm')
  }

  function onConfirm() {
    createWorkspaceAndContinue(workspaceName)
  }

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-white"
            aria-hidden="true"
          >
            <path d="M3 3h7v7H3z" />
            <path d="M14 3h7v7h-7z" />
            <path d="M14 14h7v7h-7z" />
            <path d="M3 14h7v7H3z" />
          </svg>
        </div>
        <span className="font-semibold text-slate-900 text-lg tracking-tight">PipeFlow</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {(['create', 'confirm'] as const).map((s, i) => {
          const isActive = step === s
          const isDone = step === 'confirm' && s === 'create'
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`h-px w-8 transition-colors ${isDone || isActive ? 'bg-indigo-500' : 'bg-slate-200'}`}
                />
              )}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone
                    ? 'bg-indigo-500 text-white'
                    : isActive
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
              >
                {s === 'create' ? 'Seu workspace' : 'Confirmação'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Passo 1 — Criar workspace */}
      {step === 'create' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Crie seu workspace</h1>
            <p className="text-slate-500 text-sm">
              Um workspace é o espaço da sua empresa ou time dentro do PipeFlow.
            </p>
          </div>

          <form onSubmit={handleSubmit(onWorkspaceSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="workspaceName" className="text-slate-700">
                Nome da empresa ou time
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="workspaceName"
                  type="text"
                  placeholder="Ex: Acme Corp ou Time de Vendas"
                  autoComplete="organization"
                  aria-invalid={!!errors.workspaceName}
                  aria-describedby={errors.workspaceName ? 'workspace-error' : undefined}
                  className="pl-9 text-slate-900 placeholder:text-slate-400"
                  {...register('workspaceName')}
                />
              </div>
              {errors.workspaceName && (
                <p id="workspace-error" className="text-xs text-red-600" role="alert">
                  {errors.workspaceName.message}
                </p>
              )}
              <p className="text-xs text-slate-400">
                Você poderá convidar colaboradores depois.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Continuar
            </Button>
          </form>
        </div>
      )}

      {/* Passo 2 — Confirmação */}
      {step === 'confirm' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Tudo pronto!</h1>
            <p className="text-slate-500 text-sm">Confirme os dados antes de começar.</p>
          </div>

          {/* Resumo */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Workspace
                </p>
                <p className="font-semibold text-slate-900">{workspaceName}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>
                <span className="font-medium text-slate-700">Plano:</span> Free
              </div>
              <div>
                <span className="font-medium text-slate-700">Colaboradores:</span> até 2
              </div>
              <div>
                <span className="font-medium text-slate-700">Leads:</span> até 50
              </div>
              <div>
                <span className="font-medium text-slate-700">Preço:</span> Grátis
              </div>
            </div>
          </div>

          {/* Erro global */}
          {error && (
            <div
              role="alert"
              className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={onConfirm} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Criando workspace…
                </>
              ) : (
                'Começar a usar o PipeFlow'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-slate-500"
              onClick={() => setStep('create')}
              disabled={loading}
            >
              Voltar e editar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
