-- Migration 0005 — bitácora de recordatorios enviados
--
-- guests.reminder_sent (0004) solo dice QUÉ offsets recibió un invitado: alcanza
-- para la idempotencia, pero no para auditar. No registra cuándo se envió, no
-- guarda el id que devuelve Resend (única forma de rastrear un mail concreto en
-- su panel) y, sobre todo, NO deja rastro de los fallos: un rebote se contaba en
-- la respuesta HTTP del momento y se perdía.
--
-- Esta tabla registra cada INTENTO de envío, exitoso o no. Si un día no hay
-- ninguna fila, es señal de que el cron no corrió.
--
-- Aplicar: pegar en Supabase → SQL Editor → Run.

CREATE TABLE IF NOT EXISTS reminder_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  -- Si el guest se borra, la bitácora sobrevive: el registro de que se le mandó
  -- un mail no debe desaparecer con la fila.
  guest_id    uuid REFERENCES guests(id) ON DELETE SET NULL,
  -- Snapshot del destinatario al momento del envío (el guest puede corregir su
  -- email después; la bitácora debe decir a dónde se mandó realmente).
  email       text NOT NULL,
  offset_days integer NOT NULL,
  ok          boolean NOT NULL,
  -- Id de Resend: permite buscar ese mail exacto en su panel (entregado/rebotado).
  provider_id text,
  error       text,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

-- Consulta típica del admin: "qué se mandó en este evento, lo más reciente arriba".
CREATE INDEX IF NOT EXISTS reminder_log_event_sent_idx
  ON reminder_log (event_id, sent_at DESC);

-- Consulta típica de soporte: "¿qué le llegó a esta persona?".
CREATE INDEX IF NOT EXISTS reminder_log_guest_idx
  ON reminder_log (guest_id);

-- Sin políticas RLS: la tabla se escribe y se lee solo con service_role desde el
-- server (el cron y el panel de admin). El cliente anon no la toca.
ALTER TABLE reminder_log ENABLE ROW LEVEL SECURITY;
