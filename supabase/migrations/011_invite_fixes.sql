-- ============================================================
-- Migration 011 — invite security fixes
-- ============================================================

-- Fix 1: Substituir UNIQUE(workspace_id, email) por partial unique index
-- para permitir re-convidar após aceite ou após remoção do membro.
-- O índice único antigo era implícito via constraint na tabela criada em 009.
-- Aqui criamos o índice parcial equivalente (idempotente).
create unique index if not exists workspace_invites_pending_email_uniq
  on public.workspace_invites(workspace_id, email)
  where accepted_at is null;

-- Fix 2: Adicionar validação de email no RPC accept_workspace_invite.
-- Garante que o usuário autenticado só pode aceitar um convite destinado
-- ao seu próprio email — impede que terceiros usem tokens interceptados.
create or replace function public.accept_workspace_invite(p_token text)
returns json language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite  public.workspace_invites%rowtype;
  v_user_id uuid;
  v_email   text;
  v_count   int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  -- Obtém o email do utilizador autenticado a partir de auth.users
  select email into v_email from auth.users where id = v_user_id;

  select * into v_invite
  from public.workspace_invites
  where token = p_token
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'invite_invalid_or_expired' using errcode = 'P0003';
  end if;

  -- Garante que o convite é para o utilizador autenticado
  if lower(v_invite.email) <> lower(v_email) then
    raise exception 'invite_email_mismatch' using errcode = 'P0005';
  end if;

  -- Verifica limite Free (máx 2 membros)
  select count(*) into v_count
  from public.workspace_members
  where workspace_id = v_invite.workspace_id;

  if v_count >= 2 then
    if exists (
      select 1 from public.workspaces
      where id = v_invite.workspace_id and plan = 'free'
    ) then
      raise exception 'free_plan_member_limit' using errcode = 'P0004';
    end if;
  end if;

  -- Upsert: idempotente se o utilizador já for membro
  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_invite.workspace_id, v_user_id, v_invite.role)
  on conflict (workspace_id, user_id) do nothing;

  -- Marca como aceito
  update public.workspace_invites
  set accepted_at = now()
  where id = v_invite.id;

  return json_build_object(
    'workspace_id', v_invite.workspace_id,
    'role',         v_invite.role
  );
end;
$$;

revoke execute on function public.accept_workspace_invite(text) from public;
revoke execute on function public.accept_workspace_invite(text) from anon;
grant  execute on function public.accept_workspace_invite(text) to authenticated;
