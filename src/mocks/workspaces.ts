import type { Workspace, WorkspaceMember } from '@/types/workspace'

// Dados fictícios para a FASE 1 (UI sem backend).
// Substituídos por dados reais do Supabase no M8.
export const mockWorkspaces: Workspace[] = [
  { id: 'ws-1', name: 'Meu Workspace', plan: 'pro' },
  { id: 'ws-2', name: 'Projeto Cliente A', plan: 'free' },
  { id: 'ws-3', name: 'Freelance', plan: 'free' },
]

export const mockCurrentUser: WorkspaceMember = {
  id: 'user-1',
  name: 'Sizenando Miguel',
  email: 'sizethoth@gmail.com',
  role: 'admin',
}
