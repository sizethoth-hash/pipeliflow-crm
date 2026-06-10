import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'

export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </QueryProvider>
  )
}
