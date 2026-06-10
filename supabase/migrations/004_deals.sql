-- ============================================================
-- Migration 004 — deals
-- ============================================================

create type public.deal_stage as enum (
  'new_lead',
  'contacted',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

create table public.deals (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  lead_id       uuid references public.leads(id) on delete set null,
  title         text not null,
  value         numeric(12, 2) not null default 0,
  stage         public.deal_stage not null default 'new_lead',
  owner_id      uuid not null references auth.users(id) on delete restrict,
  due_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_deals_workspace_id on public.deals(workspace_id);
create index idx_deals_lead_id      on public.deals(lead_id);
create index idx_deals_owner_id     on public.deals(owner_id);
create index idx_deals_stage        on public.deals(workspace_id, stage);
create index idx_deals_due_date     on public.deals(workspace_id, due_date);

create trigger trg_deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- ── RLS ────────────────────────────────────────────────────
alter table public.deals enable row level security;

create policy "deals_select"
  on public.deals for select
  using (public.is_workspace_member(workspace_id));

create policy "deals_insert"
  on public.deals for insert
  with check (public.is_workspace_member(workspace_id));

create policy "deals_update"
  on public.deals for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "deals_delete"
  on public.deals for delete
  using (public.is_workspace_member(workspace_id));
