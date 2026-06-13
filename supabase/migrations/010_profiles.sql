-- ============================================================
-- Migration 010 — profiles
-- Espelha dados públicos de auth.users para evitar chamadas
-- auth.admin (service role) em queries de listagem de membros.
-- ============================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── RLS ────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Qualquer usuário autenticado pode ver perfis
create policy "profiles_select"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Apenas o próprio usuário atualiza seu perfil
create policy "profiles_update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── Trigger: cria profile ao registrar novo usuário ────────
create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = excluded.full_name,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$;

create trigger trg_auth_users_profile
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Retroativo: popula profiles para usuários existentes ───
insert into public.profiles (id, email, full_name, avatar_url)
select
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;
