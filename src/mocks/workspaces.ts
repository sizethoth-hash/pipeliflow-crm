import type { Workspace, WorkspaceMember } from '@/types/workspace'

export const mockWorkspaces: Workspace[] = [
  { id: 'ws-1', name: 'Acme Corp', plan: 'pro' },
  { id: 'ws-2', name: 'Startup XYZ', plan: 'free' },
  { id: 'ws-3', name: 'Freelance Projetos', plan: 'free' },
]

export const mockCurrentUser: WorkspaceMember = {
  id: 'user-1',
  name: 'Carlos Silva',
  email: 'carlos@acmecorp.com',
  role: 'admin',
}
