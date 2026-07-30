-- Migration 0004 — tracking de recordatorios enviados (Bloque B)
-- reminder_sent: array de offsets (días antes) ya enviados a ese invitado, ej. [10, 5].
-- Garantiza idempotencia: el cron nunca manda dos veces el mismo recordatorio.
-- Aplicar: pegar en Supabase → SQL Editor → Run.

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS reminder_sent jsonb NOT NULL DEFAULT '[]'::jsonb;
