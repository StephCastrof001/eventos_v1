-- REFINE de deuda técnica (ver lib/events.ts override test1).
-- El form de crear-evento y lib/email-template.ts ya esperan estos campos;
-- faltan en DB. Aplicar en Supabase SQL Editor cuando se quiera data-driven
-- (en vez del override hardcodeado de test1).
alter table events
  add column if not exists end_date      timestamptz,
  add column if not exists location_type text,
  add column if not exists location_url  text,
  add column if not exists instructions  text;
