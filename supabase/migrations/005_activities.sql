-- ============================================================
-- Migration 005 — activities
-- ============================================================

create type public.activity_type as enum ('call', 'email', 'meeting', 'note');

create table public.activities (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  lead_id       uuid not null references public.leads(id) on delete cascade,
  type          public.activity_type not null,
  description   text not null,
  author_id     uuid not null references auth.users(id) on delete restrict,
  created_at    timestamptz not null default now()
);

create index idx_activities_workspace_id on public.activities(workspace_id);
create index idx_activities_lead_id      on public.activities(lead_id);
create index idx_activities_author_id    on public.activities(author_id);
-- cronologia reversa é o acesso mais comum
create index idx_activities_lead_created on public.activities(lead_id, created_at desc);

-- ── RLS ────────────────────────────────────────────────────
alter table public.activities enable row level security;

create policy "activities_select"
  on public.activities for select
  using (public.is_workspace_member(workspace_id));

create policy "activities_insert"
  on public.activities for insert
  with check (public.is_workspace_member(workspace_id));

-- Apenas o autor edita a própria atividade; admin pode editar qualquer uma
create policy "activities_update"
  on public.activities for update
  using (
    author_id = auth.uid()
    or public.is_workspace_admin(workspace_id)
  )
  with check (
    author_id = auth.uid()
    or public.is_workspace_admin(workspace_id)
  );

create policy "activities_delete"
  on public.activities for delete
  using (
    author_id = auth.uid()
    or public.is_workspace_admin(workspace_id)
  );
