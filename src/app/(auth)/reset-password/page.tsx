'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase/client'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const { loading, error, updatePassword } = useAuth()
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    async function checkSession() {
      const supabase = getBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      setHasSession(!!session)
      setSessionChecked(true)
    }

    checkSession()
  }, [])

  function onSubmit(data: ResetPasswordFormData) {
    updatePassword(data.password)
  }

  if (!sessionChecked) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="md" />
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Código inválido ou expirado</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Sua verificação não é válida ou já expirou.
            <br />
            Solicite um novo código para redefinir sua senha.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/forgot-password">Solicitar novo código</Link>
        </Button>

        <p className="text-sm text-slate-500">
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            Voltar para o login
          </Link>
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
        <h1 className="text-2xl font-bold text-slate-900">Redefinir senha</h1>
        <p className="text-slate-500 text-sm">Escolha uma nova senha para sua conta</p>
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
          <Label htmlFor="password" className="text-slate-700">
            Nova senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="text-slate-900 placeholder:text-slate-400"
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" className="text-xs text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-slate-700">
            Confirmar nova senha
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            className="text-slate-900 placeholder:text-slate-400"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="text-xs text-red-600" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="border-white/30 border-t-white" />
              Salvando…
            </>
          ) : (
            'Redefinir senha'
          )}
        </Button>
      </form>
    </div>
  )
}
