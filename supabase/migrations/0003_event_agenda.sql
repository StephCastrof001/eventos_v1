-- Migration 0003 — agenda del evento (Bloque C)
-- Lista de paneles/charlas con panelistas. jsonb: [{time, title, speaker, role, photo_url}]
-- Aplicar: pegar en Supabase → SQL Editor → Run. (correr DESPUÉS de 0002)

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS agenda jsonb NOT NULL DEFAULT '[]'::jsonb;
