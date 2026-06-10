import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
