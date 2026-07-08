import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient } from '@/lib/supabase/server'

const bodySchema = z.object({
  name: z.string().min(2).max(50),
})

export async function POST(request: Request) {
  const supabase = await getServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nome do workspace inválido.' }, { status: 400 })
  }

  // Cria workspace + membro admin em uma única transação via RPC
  const { data: workspace, error: rpcError } = await supabase.rpc('create_workspace_with_admin', {
    p_name: parsed.data.name,
  })

  if (rpcError) {
    const status = rpcError.message.includes('not_authenticated') ? 401 : 500
    return NextResponse.json({ error: 'Erro ao criar workspace.' }, { status })
  }

  return NextResponse.json({ workspace }, { status: 201 })
}
