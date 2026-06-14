'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

interface UpsellDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
}

export function UpsellDialog({ open, onClose, title, description }: UpsellDialogProps) {
  const router = useRouter()

  function handleUpgrade() {
    onClose()
    router.push('/settings/billing')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">⚡</span> {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-400">{description}</p>

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white">
            Agora não
          </Button>
          <Button onClick={handleUpgrade}>
            Ver plano Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
