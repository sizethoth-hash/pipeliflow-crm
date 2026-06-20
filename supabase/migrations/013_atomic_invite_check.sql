-- Migration: verificação atômica de limite do plano Free antes de criar convite
-- Resolve race condition onde múltiplos convites simultâneos ultrapassavam o limite

create or replace function public.create_invite_if_allowed(
  p_workspace_id uuid,
  p_email        text,
  p_role         text,
  p_invited_by   uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan        text;
  v_count       int;
  v_invite_id   uuid;
begin
  -- Lock exclusivo no workspace para serializar invites simultâneos
  select plan into v_plan
  from public.workspaces
  where id = p_workspace_id
  for update;

  if not found then
    raise exception 'workspace_not_found' using errcode = 'P0001';
  end if;

  if v_plan = 'free' then
    select count(*) into v_count
    from public.workspace_members
    where workspace_id = p_workspace_id;

    -- Também conta convites pendentes para não criar convites além do limite
    select v_count + count(*) into v_count
    from public.workspace_invites
    where workspace_id = p_workspace_id
      and accepted_at is null
      and expires_at > now();

    if v_count >= 2 then
      raise exception 'free_plan_invite_limit' using errcode = 'P0005';
    end if;
  end if;

  insert into public.workspace_invites (workspace_id, email, role, invited_by)
  values (p_workspace_id, p_email, p_role, p_invited_by)
  returning id into v_invite_id;

  return v_invite_id;
end;
$$;

revoke execute on function public.create_invite_if_allowed(uuid, text, text, uuid) from public;
revoke execute on function public.create_invite_if_allowed(uuid, text, text, uuid) from anon;
grant  execute on function public.create_invite_if_allowed(uuid, text, text, uuid) to authenticated;
