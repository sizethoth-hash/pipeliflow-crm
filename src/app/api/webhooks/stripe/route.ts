import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { getServiceRoleClient } from '@/lib/supabase/server'

// Stripe precisa do body raw para verificar a assinatura — não pode usar o parser JSON do Next.js
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET não configurado')
    return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[stripe/webhook] Assinatura inválida:', err)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const supabase = getServiceRoleClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const workspaceId = session.metadata?.workspace_id
        const userId = session.metadata?.user_id
        const subscriptionId = session.subscription as string

        if (!workspaceId || !subscriptionId) break

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)

        await supabase.from('subscriptions').upsert({
          workspace_id: workspaceId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          plan: 'pro',
          status: 'active',
          current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSub.cancel_at_period_end,
        }, { onConflict: 'workspace_id' })

        await supabase
          .from('workspaces')
          .update({ plan: 'pro' })
          .eq('id', workspaceId)

        console.log(`[stripe/webhook] checkout.session.completed — workspace=${workspaceId} user=${userId} → Pro`)
        break
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription
        const workspaceId = stripeSub.metadata?.workspace_id

        if (!workspaceId) break

        await supabase.from('subscriptions').upsert({
          workspace_id: workspaceId,
          stripe_customer_id: stripeSub.customer as string,
          stripe_subscription_id: stripeSub.id,
          plan: 'free',
          status: 'canceled',
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
        }, { onConflict: 'workspace_id' })

        await supabase
          .from('workspaces')
          .update({ plan: 'free' })
          .eq('id', workspaceId)

        console.log(`[stripe/webhook] customer.subscription.deleted — workspace=${workspaceId} → Free`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const workspaceId = invoice.subscription_details?.metadata?.workspace_id

        if (!workspaceId) break

        await supabase.from('subscriptions')
          .update({ status: 'payment_failed' })
          .eq('workspace_id', workspaceId)

        console.log(`[stripe/webhook] invoice.payment_failed — workspace=${workspaceId} → past_due`)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`[stripe/webhook] Erro ao processar ${event.type}:`, err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
