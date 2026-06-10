-- ============================================================
-- Migration 007 — Melhores práticas de segurança e consistência
-- ============================================================

-- ── 1. Fixar search_path nas funções SECURITY DEFINER ──────────────
-- Funções SECURITY DEFINER sem search_path fixo são vulneráveis a
-- search path injection: um usuário malicioso pode criar uma tabela
-- com o mesmo nome em outro schema e sequestrar a execução.

create or replace function public.set_updated_at()
returns trigger language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql
security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean language sql
security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.create_free_subscription()
returns trigger language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (workspace_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

-- ── 2. Função atômica para criar workspace + membro admin ──────────
-- Substitui o rollback manual na API Route por uma transação real no banco.
-- Chamada via RPC: supabase.rpc('create_workspace_with_admin', { p_name: '...' })
create or replace function public.create_workspace_with_admin(p_name text)
returns json language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_user_id      uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if length(trim(p_name)) < 2 or length(p_name) > 50 then
    raise exception 'invalid_workspace_name' using errcode = 'P0002';
  end if;

  -- Insere workspace
  insert into public.workspaces (name, owner_id, plan)
  values (trim(p_name), v_user_id, 'free')
  returning id into v_workspace_id;

  -- Adiciona criador como admin — na mesma transação
  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, v_user_id, 'admin');

  return json_build_object(
    'id',   v_workspace_id,
    'name', trim(p_name),
    'plan', 'free'
  );
end;
$$;

-- Apenas authenticated pode chamar — anon e public não têm acesso
revoke execute on function public.create_workspace_with_admin(text) from public;
revoke execute on function public.create_workspace_with_admin(text) from anon;
grant  execute on function public.create_workspace_with_admin(text) to authenticated;
