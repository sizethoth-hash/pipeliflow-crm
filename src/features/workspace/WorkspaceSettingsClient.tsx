'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useDeleteWorkspace, useUpdateWorkspaceName } from '@/hooks/useWorkspaces'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

const nameSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
})
type NameForm = z.infer<typeof nameSchema>

export function WorkspaceSettingsClient() {
  const router = useRouter()
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const updateName = useUpdateWorkspaceName()
  const deleteWorkspace = useDeleteWorkspace()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: activeWorkspace?.name ?? '' },
  })

  useEffect(() => {
    if (activeWorkspace) reset({ name: activeWorkspace.name })
  }, [activeWorkspace, reset])

  async function onSubmit(data: NameForm) {
    await updateName.mutateAsync(data.name)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleDelete() {
    await deleteWorkspace.mutateAsync()
    router.push('/dashboard')
  }

  if (!activeWorkspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Building2 className="h-6 w-6 text-indigo-400" aria-hidden="true" />
        <div>
          <h2 className="text-xl font-bold text-slate-100">Workspace</h2>
          <p className="text-sm text-slate-400">Configurações gerais do workspace</p>
        </div>
      </div>

      <div className="max-w-lg space-y-8">
        {/* Plano atual */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Plano atual</h3>
          <div className="flex items-center gap-3">
            <Badge
              variant={activeWorkspace.plan === 'pro' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {activeWorkspace.plan === 'pro' ? 'Pro' : 'Free'}
            </Badge>
            {activeWorkspace.plan === 'free' && (
              <span className="text-xs text-slate-500">Limite: 2 membros · 50 leads</span>
            )}
          </div>
        </section>

        {/* Nome do workspace */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-200">Nome do workspace</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name" className="text-slate-300">
                Nome
              </Label>
              <Input
                id="ws-name"
                {...register('name')}
                className="border-slate-600 bg-slate-700 text-slate-100 focus-visible:ring-indigo-500"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={!isDirty || updateName.isPending}>
                {updateName.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : saved ? (
                  'Salvo!'
                ) : (
                  'Salvar'
                )}
              </Button>
              {updateName.error && (
                <p className="text-xs text-red-400">{updateName.error.message}</p>
              )}
            </div>
          </form>
        </section>

        {/* Danger zone */}
        <section className="rounded-xl border border-red-900/40 bg-red-950/20 p-5">
          <h3 className="mb-1 text-sm font-semibold text-red-400">Zona de perigo</h3>
          <p className="mb-4 text-xs text-slate-500">
            Excluir o workspace remove permanentemente todos os leads, negócios e atividades. Esta
            ação não pode ser desfeita.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Excluir workspace
          </Button>
        </section>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Excluir workspace"
        description={`Tem certeza que deseja excluir "${activeWorkspace.name}"? Todos os dados serão perdidos permanentemente.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
      />
    </div>
  )
}
