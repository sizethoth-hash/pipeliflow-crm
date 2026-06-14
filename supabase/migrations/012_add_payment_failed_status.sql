-- ============================================================
-- Migration 012 — adiciona 'payment_failed' ao enum subscription_status
-- ============================================================

alter type public.subscription_status add value if not exists 'payment_failed';
