-- Runbook one-time — reprogramar evento test1 al 19 ago 2026 (data-driven, Bloque A)
-- Correr en Supabase → SQL Editor → Run, EN ESTE ORDEN.
-- Prerequisito: migraciones 0002 y 0003 ya aplicadas (abajo se incluyen por idempotencia).

-- 1) Columnas (idempotente: si ya corriste 0002/0003, no rompe)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS end_date      timestamptz,
  ADD COLUMN IF NOT EXISTS location_url  text,
  ADD COLUMN IF NOT EXISTS location_type text,
  ADD COLUMN IF NOT EXISTS instructions  text,
  ADD COLUMN IF NOT EXISTS organizer     text,
  ADD COLUMN IF NOT EXISTS description   text,
  ADD COLUMN IF NOT EXISTS agenda        jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Datos del evento (nueva fecha/lugar) — reemplaza el hardcode que estaba en lib/events.ts
UPDATE events SET
  event_date    = '2026-08-19T19:00:00-05:00',   -- 7pm Lima
  end_date      = '2026-08-19T21:00:00-05:00',   -- 9pm Lima
  location      = 'Av. Juan de Arona 720, San Isidro, Lima',
  location_type = 'Presencial',
  location_url  = 'https://www.google.com/maps/search/?api=1&query=Av.+Juan+de+Arona+720+San+Isidro+Lima',
  agenda        = '[
    {"time":"19:00","title":"Apertura — Inauguración comunidad HACK IA","speaker":"Panelista 1 (TEST)","role":"Organización","photo_url":null},
    {"time":"19:20","title":"Panel: IA aplicada en producto (TEST)","speaker":"Panelista 2 (TEST)","role":"Invitada","photo_url":null},
    {"time":"20:10","title":"Networking y cierre","speaker":null,"role":null,"photo_url":null}
  ]'::jsonb
WHERE slug = 'test1';

-- 3) Verificar
SELECT slug, event_date, end_date, location, location_type, jsonb_array_length(agenda) AS paneles
FROM events WHERE slug = 'test1';
