-- ============================================================
-- Migration 006 — subscriptions
-- ============================================================

create type public.subscription_status as enum (
  'active',
  'canceled',
  'past_due',
  'trialing',
  'incomplete'
);

create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  workspace_id            uuid not null unique references public.workspaces(id) on delete cascade,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  plan                    public.plan_type not null default 'free',
  status                  public.subscription_status not null default 'active',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_subscriptions_workspace_id           on public.subscriptions(workspace_id);
create index idx_subscriptions_stripe_customer_id     on public.subscriptions(stripe_customer_id);
create index idx_subscriptions_stripe_subscription_id on public.subscriptions(stripe_subscription_id);

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Auto-cria registro free quando workspace é criado
create or replace function public.create_free_subscription()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (workspace_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

create trigger trg_workspace_create_subscription
  after insert on public.workspaces
  for each row execute function public.create_free_subscription();

-- ── RLS ────────────────────────────────────────────────────
alter table public.subscriptions enable row level security;

-- Membros do workspace veem o plano/status
create policy "subscriptions_select"
  on public.subscriptions for select
  using (public.is_workspace_member(workspace_id));

-- Apenas service_role (webhook Stripe) escreve — bloqueado para roles normais
create policy "subscriptions_insert"
  on public.subscriptions for insert
  with check (false);

create policy "subscriptions_update"
  on public.subscriptions for update
  using (false);

create policy "subscriptions_delete"
  on public.subscriptions for delete
  using (false);
