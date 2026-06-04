import { create } from 'zustand'
import { mockCurrentUser, mockWorkspaces } from '@/mocks/workspaces'
import type { Workspace, WorkspaceMember } from '@/types/workspace'

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspace: Workspace
  currentUser: WorkspaceMember
  setActiveWorkspace: (workspace: Workspace) => void
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  workspaces: mockWorkspaces,
  activeWorkspace: mockWorkspaces[0],
  currentUser: mockCurrentUser,
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}))
