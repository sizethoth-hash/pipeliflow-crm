import { getBrowserClient } from '@/lib/supabase/client'
import type { Workspace } from '@/types/workspace'
import { create } from 'zustand'

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  isLoading: boolean
  setActiveWorkspace: (workspace: Workspace) => void
  loadWorkspaces: () => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  loadWorkspaces: async () => {
    set({ isLoading: true })
    try {
      const supabase = getBrowserClient()

      // Busca os workspace_ids do usuário via workspace_members
      const { data: members, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')

      if (memberError || !members?.length) {
        set({ workspaces: [], activeWorkspace: null, isLoading: false })
        return
      }

      const ids = members.map((m) => m.workspace_id)

      const { data: rows, error: wsError } = await supabase
        .from('workspaces')
        .select('id, name, plan')
        .in('id', ids)
        .order('created_at', { ascending: true })

      if (wsError || !rows) {
        set({ workspaces: [], activeWorkspace: null, isLoading: false })
        return
      }

      const workspaces: Workspace[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        plan: r.plan,
      }))

      const current = get().activeWorkspace
      const activeStillExists = current && workspaces.some((w) => w.id === current.id)

      set({
        workspaces,
        activeWorkspace: activeStillExists ? current : (workspaces[0] ?? null),
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },
}))
