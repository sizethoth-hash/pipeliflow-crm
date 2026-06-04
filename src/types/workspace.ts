export type Plan = 'free' | 'pro'
export type Role = 'admin' | 'member'

export interface Workspace {
  id: string
  name: string
  plan: Plan
}

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
}
