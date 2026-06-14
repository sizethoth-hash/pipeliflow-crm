import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { workspaceId, userId } = await request.json()

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId obrigatório' }, { status: 400 })
  }

  const priceId = process.env.STRIPE_PRICE_ID_PRO
  if (!priceId) {
    return NextResponse.json({ error: 'STRIPE_PRICE_ID_PRO não configurado' }, { status: 500 })
  }

  const supabase = getServiceRoleClient()

  // Reutiliza customer existente se já houver
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('workspace_id', workspaceId)
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: sub?.stripe_customer_id ?? undefined,
    metadata: { workspace_id: workspaceId, user_id: userId },
    subscription_data: { metadata: { workspace_id: workspaceId } },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=1`,
  })

  return NextResponse.json({ url: session.url })
}
