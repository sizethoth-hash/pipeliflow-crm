'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const verifyCodeSchema = z.object({
  token: z.string().min(6, 'Informe o código recebido por e-mail').max(8, 'Código inválido'),
})

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { loading, error, clearError, requestPasswordReset, verifyRecoveryOtp } = useAuth()
  const [emailSent, setEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: codeErrors },
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    const success = await requestPasswordReset(data.email)
    if (success) {
      setSubmittedEmail(data.email)
      setEmailSent(true)
    }
  }

  async function onSubmitCode(data: VerifyCodeFormData) {
    const success = await verifyRecoveryOtp(submittedEmail, data.token)
    if (success) {
      router.push('/reset-password')
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
              <KeyRound className="h-7 w-7 text-indigo-600" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Verifique seu e-mail</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Enviamos um código de 6 dígitos para{' '}
              <span className="font-medium text-slate-700">{submittedEmail}</span>.
              <br />
              Informe o código abaixo para continuar.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitCode(onSubmitCode)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="token" className="text-slate-700">
              Código de verificação
            </Label>
            <Input
              id="token"
              type="text"
              inputMode="numeric"
              placeholder="00000000"
              autoComplete="one-time-code"
              maxLength={8}
              aria-invalid={!!codeErrors.token}
              aria-describedby={codeErrors.token ? 'token-error' : undefined}
              className="text-slate-900 placeholder:text-slate-400 text-center tracking-[0.5em] font-mono"
              {...registerCode('token')}
            />
            {codeErrors.token && (
              <p id="token-error" className="text-xs text-red-600" role="alert">
                {codeErrors.token.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Verificando…
              </>
            ) : (
              'Verificar código'
            )}
          </Button>
        </form>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Não recebeu o e-mail? Verifique sua caixa de spam ou aguarde alguns minutos.
        </div>

        <p className="text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={() => {
              clearError()
              setEmailSent(false)
            }}
            className="text-indigo-600 font-medium hover:underline"
          >
            Usar outro e-mail
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 lg:hidden mb-4">
          <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-white"
              aria-hidden="true"
            >
              <path d="M3 3h7v7H3z" />
              <path d="M14 3h7v7h-7z" />
              <path d="M14 14h7v7h-7z" />
              <path d="M3 14h7v7H3z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900 text-base">PipeFlow</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Esqueceu sua senha?</h1>
        <p className="text-slate-500 text-sm">
          Informe seu e-mail e enviaremos um código para redefinir sua senha
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@empresa.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="text-slate-900 placeholder:text-slate-400"
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="border-white/30 border-t-white" />
              Enviando…
            </>
          ) : (
            'Enviar código de recuperação'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Lembrou a senha?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  )
}
