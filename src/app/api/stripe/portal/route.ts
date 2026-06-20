import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerClient, getServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await getServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { workspaceId } = body

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId obrigatório' }, { status: 400 })
  }

  // Verifica que o usuário autenticado é admin do workspace via RLS
  const { data: isAdmin } = await supabase.rpc('is_workspace_admin', {
    p_workspace_id: workspaceId,
  })

  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const serviceSupabase = getServiceRoleClient()

  const { data: sub } = await serviceSupabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('workspace_id', workspaceId)
    .single()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'Cliente Stripe não encontrado' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return NextResponse.json({ url: session.url })
}
