-- ============================================================
-- Migration 001 — workspaces
-- ============================================================

create type public.plan_type as enum ('free', 'pro');

create table public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  plan        public.plan_type not null default 'free',
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_workspaces_owner_id on public.workspaces(owner_id);

-- updated_at auto-trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

-- ── RLS ────────────────────────────────────────────────────
alter table public.workspaces enable row level security;

-- workspace_select é criada em 002 (depende de workspace_members)

-- Apenas o owner cria (via onboarding)
create policy "workspace_insert"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

-- Apenas o owner atualiza
create policy "workspace_update"
  on public.workspaces for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Apenas o owner exclui
create policy "workspace_delete"
  on public.workspaces for delete
  using (owner_id = auth.uid());
