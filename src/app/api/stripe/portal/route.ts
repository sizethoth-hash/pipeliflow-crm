import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { workspaceId } = await request.json()

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId obrigatório' }, { status: 400 })
  }

  const supabase = getServiceRoleClient()

  const { data: sub } = await supabase
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
