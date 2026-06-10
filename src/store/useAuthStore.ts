import { getBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isLoading: boolean
  initialized: boolean
  _unsubscribe: (() => void) | null
  setUser: (user: User | null) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  initialized: false,
  _unsubscribe: null,

  setUser: (user) => set({ user }),

  initialize: async () => {
    const supabase = getBrowserClient()

    const { data: { user } } = await supabase.auth.getUser()
    set({ user, isLoading: false, initialized: true })

    // Retorno da subscription é armazenado para cleanup se necessário
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null })
    })

    // Cleanup registrado no próprio store para ser chamado quando necessário
    useAuthStore.setState({ _unsubscribe: subscription.unsubscribe })
  },
}))
