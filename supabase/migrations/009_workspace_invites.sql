-- ============================================================
-- Migration 009 — workspace_invites
-- ============================================================

create table if not exists public.workspace_invites (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  email         text not null,
  role          public.member_role not null default 'member',
  token         text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by    uuid not null references auth.users(id) on delete cascade,
  accepted_at   timestamptz,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  created_at    timestamptz not null default now()
);

create index if not exists idx_workspace_invites_token        on public.workspace_invites(token);
create index if not exists idx_workspace_invites_workspace_id on public.workspace_invites(workspace_id);

-- ── RLS ────────────────────────────────────────────────────
alter table public.workspace_invites enable row level security;

drop policy if exists "invites_select" on public.workspace_invites;
drop policy if exists "invites_insert" on public.workspace_invites;
drop policy if exists "invites_delete" on public.workspace_invites;

-- Membros do workspace veem seus convites pendentes
create policy "invites_select"
  on public.workspace_invites for select
  using (public.is_workspace_member(workspace_id));

-- Apenas admin cria convites
create policy "invites_insert"
  on public.workspace_invites for insert
  with check (public.is_workspace_admin(workspace_id));

-- Admin pode deletar convites
create policy "invites_delete"
  on public.workspace_invites for delete
  using (public.is_workspace_admin(workspace_id));

-- ── Função: aceitar convite ─────────────────────────────────
-- Chamada via RPC pelo usuário autenticado com o token do link.
-- Valida expiração, adiciona ao workspace, marca como aceito.
create or replace function public.accept_workspace_invite(p_token text)
returns json language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite  public.workspace_invites%rowtype;
  v_user_id uuid;
  v_count   int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select * into v_invite
  from public.workspace_invites
  where token = p_token
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'invite_invalid_or_expired' using errcode = 'P0003';
  end if;

  -- Verifica limite Free (máx 2 membros)
  select count(*) into v_count
  from public.workspace_members
  where workspace_id = v_invite.workspace_id;

  if v_count >= 2 then
    -- Verifica se o workspace é Free
    if exists (
      select 1 from public.workspaces
      where id = v_invite.workspace_id and plan = 'free'
    ) then
      raise exception 'free_plan_member_limit' using errcode = 'P0004';
    end if;
  end if;

  -- Upsert: idempotente se o usuário já for membro
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

-- ── Função: contar membros do workspace ────────────────────
create or replace function public.get_workspace_member_count(p_workspace_id uuid)
returns int language sql
security definer stable
set search_path = public
as $$
  select count(*)::int from public.workspace_members
  where workspace_id = p_workspace_id;
$$;

grant execute on function public.get_workspace_member_count(uuid) to authenticated;
