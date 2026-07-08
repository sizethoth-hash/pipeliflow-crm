import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

// Só disponível fora de production — protege contra chamadas acidentais em prod
export async function DELETE(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' }, { status: 500 })
  }

  const { leadNames, dealTitles } = (await req.json()) as {
    leadNames?: string[]
    dealTitles?: string[]
  }

  const admin = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  })

  const errors: string[] = []

  if (leadNames?.length) {
    // Deletar atividades vinculadas primeiro (FK)
    const { data: leads } = await admin.from('leads').select('id').in('name', leadNames)

    if (leads?.length) {
      const ids = leads.map((l) => l.id)
      const { error: actErr } = await admin.from('activities').delete().in('lead_id', ids)
      if (actErr) errors.push(`activities: ${actErr.message}`)

      const { error: dealsErr } = await admin.from('deals').delete().in('lead_id', ids)
      if (dealsErr) errors.push(`deals by lead: ${dealsErr.message}`)
    }

    const { error: leadErr } = await admin.from('leads').delete().in('name', leadNames)
    if (leadErr) errors.push(`leads: ${leadErr.message}`)
  }

  if (dealTitles?.length) {
    const { error: dealErr } = await admin.from('deals').delete().in('title', dealTitles)
    if (dealErr) errors.push(`deals: ${dealErr.message}`)
  }

  if (errors.length) {
    return NextResponse.json({ errors }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
