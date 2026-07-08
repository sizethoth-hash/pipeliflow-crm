import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient } from '@/lib/supabase/server'
import { acceptInvite } from '@/services/workspaces'

const bodySchema = z.object({ token: z.string().min(1) })

export async function POST(request: Request) {
  const supabase = await getServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }

  try {
    const result = await acceptInvite(parsed.data.token)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao aceitar convite'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
