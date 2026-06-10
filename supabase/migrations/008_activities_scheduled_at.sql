-- ============================================================
-- Migration 008 — add scheduled_at to activities
-- ============================================================

alter table public.activities
  add column scheduled_at timestamptz null;

comment on column public.activities.scheduled_at is
  'Data/hora agendada para a atividade (opcional). Null = sem agendamento.';
