'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function clearError() {
    setError(null)
  }

  async function signIn(email: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const supabase = getBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar. Tente novamente.'
      setError(mapAuthError(msg))
    } finally {
      setLoading(false)
    }
  }

  async function signUp(name: string, email: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const supabase = getBrowserClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (authError) throw authError
      // Se a sessão foi criada imediatamente (confirmação desabilitada), vai para onboarding.
      // Se não (confirmação habilitada), vai para página de verificação de email.
      if (data.session) {
        router.push('/onboarding')
      } else {
        router.push('/verify-email')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.'
      setError(mapAuthError(msg))
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)
    try {
      const supabase = getBrowserClient()
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (authError) throw authError
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar com Google.'
      setError(mapAuthError(msg))
      setLoading(false)
    }
    // loading fica true até o redirect do OAuth
  }

  async function requestPasswordReset(email: string) {
    setLoading(true)
    setError(null)
    try {
      const supabase = getBrowserClient()
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email)
      if (authError) throw authError
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar e-mail. Tente novamente.'
      setError(mapAuthError(msg))
      return false
    } finally {
      setLoading(false)
    }
  }

  async function verifyRecoveryOtp(email: string, token: string) {
    setLoading(true)
    setError(null)
    try {
      const supabase = getBrowserClient()
      const { error: authError } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
      if (authError) throw authError
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Código inválido ou expirado.'
      setError(mapAuthError(msg))
      return false
    } finally {
      setLoading(false)
    }
  }

  async function updatePassword(password: string) {
    setLoading(true)
    setError(null)
    try {
      const supabase = getBrowserClient()
      const { error: authError } = await supabase.auth.updateUser({ password })
      if (authError) throw authError
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao redefinir senha. Tente novamente.'
      setError(mapAuthError(msg))
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    setLoading(true)
    try {
      const supabase = getBrowserClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function createWorkspaceAndContinue(workspaceName: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Erro ao criar workspace.')
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar workspace. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    clearError,
    signIn,
    signUp,
    signInWithGoogle,
    requestPasswordReset,
    verifyRecoveryOtp,
    updatePassword,
    signOut,
    createWorkspaceAndContinue,
  }
}

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (message.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (message.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (message.includes('Password should be')) return 'A senha deve ter ao menos 6 caracteres.'
  return message
}
