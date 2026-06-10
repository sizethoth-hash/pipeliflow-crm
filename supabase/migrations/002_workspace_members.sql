-- ============================================================
-- Migration 002 — workspace_members
-- ============================================================

create type public.member_role as enum ('admin', 'member');

create table public.workspace_members (
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          public.member_role not null default 'member',
  created_at    timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index idx_workspace_members_user_id      on public.workspace_members(user_id);
create index idx_workspace_members_workspace_id on public.workspace_members(workspace_id);

-- ── RLS ────────────────────────────────────────────────────
alter table public.workspace_members enable row level security;

-- Helper: verifica se o usuário atual é membro do workspace
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- Helper: verifica se o usuário atual é admin do workspace
create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- Policy de workspaces que depende desta tabela (movida de 001)
create policy "workspace_select"
  on public.workspaces for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = id
        and wm.user_id = auth.uid()
    )
  );

-- Membros veem os outros membros do mesmo workspace
create policy "members_select"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

-- Admin (ou owner via insert no onboarding) insere membros
create policy "members_insert"
  on public.workspace_members for insert
  with check (
    public.is_workspace_admin(workspace_id)
    -- permite o owner inserir a si mesmo no onboarding
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_id
        and w.owner_id = auth.uid()
    )
  );

-- Apenas admin atualiza papéis
create policy "members_update"
  on public.workspace_members for update
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

-- Admin pode remover membros (ou membro remove a si mesmo)
create policy "members_delete"
  on public.workspace_members for delete
  using (
    public.is_workspace_admin(workspace_id)
    or user_id = auth.uid()
  );
