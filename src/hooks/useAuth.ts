'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AuthError {
  message: string
}

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function clearError() {
    setError(null)
  }

  async function signIn(_email: string, _password: string) {
    setLoading(true)
    setError(null)
    try {
      // Fake delay — substituir por supabase.auth.signInWithPassword()
      await new Promise((res) => setTimeout(res, 1000))
      router.push('/dashboard')
    } catch (err) {
      const authErr = err as AuthError
      setError(authErr.message ?? 'Erro ao entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function signUp(_name: string, _email: string, _password: string) {
    setLoading(true)
    setError(null)
    try {
      // Fake delay — substituir por supabase.auth.signUp()
      await new Promise((res) => setTimeout(res, 1000))
      router.push('/onboarding')
    } catch (err) {
      const authErr = err as AuthError
      setError(authErr.message ?? 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)
    try {
      // Fake delay — substituir por supabase.auth.signInWithOAuth({ provider: 'google' })
      await new Promise((res) => setTimeout(res, 800))
      router.push('/dashboard')
    } catch (err) {
      const authErr = err as AuthError
      setError(authErr.message ?? 'Erro ao entrar com Google.')
    } finally {
      setLoading(false)
    }
  }

  async function createWorkspaceAndContinue(_workspaceName: string) {
    setLoading(true)
    setError(null)
    try {
      // Fake delay — substituir por chamada à API de workspace
      await new Promise((res) => setTimeout(res, 1000))
      router.push('/dashboard')
    } catch (err) {
      const authErr = err as AuthError
      setError(authErr.message ?? 'Erro ao criar workspace. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, clearError, signIn, signUp, signInWithGoogle, createWorkspaceAndContinue }
}
