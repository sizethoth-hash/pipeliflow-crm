-- ============================================================
-- Migration 003 — leads
-- ============================================================

create type public.lead_status as enum (
  'new',
  'contacted',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  name             text not null,
  email            text not null,
  phone            text,
  company          text,
  job_title        text,
  status           public.lead_status not null default 'new',
  potential_value  numeric(12, 2),
  notes            text,
  owner_id         uuid not null references auth.users(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_leads_workspace_id on public.leads(workspace_id);
create index idx_leads_owner_id     on public.leads(owner_id);
create index idx_leads_status       on public.leads(workspace_id, status);

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ── RLS ────────────────────────────────────────────────────
alter table public.leads enable row level security;

create policy "leads_select"
  on public.leads for select
  using (public.is_workspace_member(workspace_id));

create policy "leads_insert"
  on public.leads for insert
  with check (public.is_workspace_member(workspace_id));

create policy "leads_update"
  on public.leads for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "leads_delete"
  on public.leads for delete
  using (public.is_workspace_member(workspace_id));
