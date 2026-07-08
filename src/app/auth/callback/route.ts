import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await getServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Verifica se o usuário já tem um workspace — se não tiver, manda para onboarding
      const { data: members } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .limit(1)

      const hasWorkspace = !!members?.length
      const redirectTo = hasWorkspace ? next : '/onboarding'
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
