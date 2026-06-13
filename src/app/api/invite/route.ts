import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getServerClient } from '@/lib/supabase/server'
import { getMemberCount } from '@/services/workspaces'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL
  if (!raw) throw new Error('NEXT_PUBLIC_APP_URL não configurado')
  try {
    return new URL(raw).origin
  } catch {
    throw new Error(`NEXT_PUBLIC_APP_URL inválido: "${raw}"`)
  }
}

const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
  workspaceId: z.string().uuid(),
})

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
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const { email, role, workspaceId } = parsed.data

  // Verifica se o usuário é admin do workspace
  const { data: isAdmin } = await supabase.rpc('is_workspace_admin', {
    p_workspace_id: workspaceId,
  })

  if (!isAdmin) {
    return NextResponse.json({ error: 'Apenas admins podem convidar membros' }, { status: 403 })
  }

  // Busca workspace para o nome
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name, plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
  }

  // Verifica limite do plano Free (máx 2 membros)
  if (workspace.plan === 'free') {
    const count = await getMemberCount(workspaceId)
    if (count >= 2) {
      return NextResponse.json(
        {
          error: 'free_plan_limit',
          message:
            'O plano Free permite no máximo 2 membros. Faça upgrade para o plano Pro para convidar mais colaboradores.',
        },
        { status: 403 },
      )
    }
  }

  // Verifica convite pendente para o mesmo email
  const { data: existing } = await supabase
    .from('workspace_invites')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Já existe um convite pendente para este e-mail' },
      { status: 409 },
    )
  }

  // Cria convite no banco
  const { data: invite, error: inviteError } = await supabase
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      email,
      role,
      invited_by: user.id,
    })
    .select('token')
    .single()

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 })
  }

  let appUrl: string
  try {
    appUrl = getAppUrl()
  } catch (err) {
    console.error('[invite] APP_URL error:', err)
    return NextResponse.json({ error: 'Configuração de URL inválida no servidor' }, { status: 500 })
  }

  const inviteUrl = `${appUrl}/invite/${invite.token}`
  const inviterName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Alguém'
  const roleLabel = role === 'admin' ? 'Administrador' : 'Membro'

  // Sanitiza valores dinâmicos antes de injetar no HTML
  const safeInviterName = escapeHtml(inviterName)
  const safeWorkspaceName = escapeHtml(workspace.name)
  const safeRoleLabel = escapeHtml(roleLabel)

  // Envia e-mail via Resend
  const { error: emailError } = await resend.emails.send({
    from: 'PipeFlow CRM <no-reply@pipeflow.app>',
    to: email,
    subject: `${safeInviterName} convidou você para o workspace "${safeWorkspaceName}"`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #fff;">
        <div style="margin-bottom: 32px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: #6366f1; border-radius: 8px; padding: 8px 12px;">
            <span style="color: #fff; font-weight: 700; font-size: 16px;">PipeFlow</span>
          </div>
        </div>

        <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">
          Você foi convidado!
        </h1>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          <strong>${safeInviterName}</strong> convidou você para colaborar no workspace
          <strong>&ldquo;${safeWorkspaceName}&rdquo;</strong> como <strong>${safeRoleLabel}</strong>.
        </p>

        <a
          href="${inviteUrl}"
          style="display: inline-block; background: #6366f1; color: #fff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none;"
        >
          Aceitar convite
        </a>

        <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">
          Este link expira em 7 dias. Se você não esperava este convite, pode ignorar este e-mail.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
          PipeFlow CRM · Gestão de clientes e vendas
        </p>
      </div>
    `,
  })

  if (emailError) {
    // Convite criado mas e-mail falhou — retorna aviso (não fatal)
    console.error('[invite] Resend error:', emailError)
    return NextResponse.json(
      { warning: 'Convite criado, mas o e-mail não pôde ser enviado.', token: invite.token },
      { status: 201 },
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
