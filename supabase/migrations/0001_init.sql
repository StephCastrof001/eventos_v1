-- Migration 0001 — schema inicial v0.3 (PRD §schema, ADR-001, ADR-002)
-- Multi-evento desde día 1. QR dual: qr_token propio + qr_url (Luma seed).
-- Aplicar: pegar en Supabase → SQL Editor → Run. (o supabase db push con CLI)

create extension if not exists "pgcrypto";

-- ===== events =====
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  event_date  timestamptz,
  location    text,
  description text,
  organizer   text,
  brand       jsonb not null default '{}'::jsonb,   -- {logo_url, palette:{canvas,primary,accent,text}, font}
  form_fields jsonb not null default '[]'::jsonb,   -- [{key,label,tipo,obligatorio}] (P2)
  created_at  timestamptz not null default now()
);

-- ===== guests =====
create table if not exists guests (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references events(id) on delete cascade,
  name            text not null,
  last_name       text,
  email           text not null,
  role            text,
  company         text,
  phone           text,
  dni             text,
  ruc             text,
  photo_url       text,
  badge_url       text,
  social_url      text,
  status          text not null default 'registered'
                    check (status in ('registered','approved','badge_ready','checked_in','rejected','canceled')),
  magic_token     text unique not null,   -- página self-service (invitado, sin cuenta)
  qr_token        text unique not null,   -- QR propio inhouse, ≠ id (ADR-002 rama B)
  qr_url          text,                    -- QR de Luma (ADR-002 rama A, seed)
  external_id     text,                    -- guest_id de Luma (seed)
  consent_at      timestamptz,             -- ADR-001 ley 29733
  consent_version text,
  created_at      timestamptz not null default now(),
  approved_at     timestamptz,
  checked_in_at   timestamptz,
  unique (event_id, email)                 -- dedupe upsert (C1)
);

-- índice para filtrar siempre por evento (C1)
create index if not exists guests_event_id_idx on guests (event_id);

-- ===== RLS (S layer) =====
-- Server usa service_role (bypassa RLS). Sin políticas públicas = anon NO lee guests.
alter table events enable row level security;
alter table guests enable row level security;
