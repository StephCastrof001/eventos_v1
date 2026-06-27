# RESEARCH — Eventos / Badges / Certificados

Fecha: 2026-06-27

## Pregunta
Customer journey de evento (50 invitados): registro → confirmación → rechazo → badge → certificados.
Decouple, escalable multi-evento, costo 0/mínimo. ¿Hasta dónde llega Luma?

## Hallazgo clave de costo
- **Luma API requiere Luma Plus (~$59/mes).** Sin Plus: NO hay API, solo export CSV manual.
- **Luma free CSV** sí exporta lista (registro, ticket, respuestas custom): https://help.luma.com/p/download-guest-csv
- **Tally webhooks = FREE para todos** → registro tiempo-real $0 sin Luma: https://tally.so/help/webhooks

## Estados canónicos del journey (estándar industria)
Fuente idloom (6 estados): https://www.idloom.com/en/resources/managing-attendee-statuses-key-component-event-planning
- Pending: Imported/Pre-reg, Notify-me, Registering, Abandoned
- Attending: Complete
- Not-attending: Canceled, Not-coming
- + 2-step approval: Confirmed / Rejected
Flujo registro CiviCRM: https://docs.civicrm.org/user/en/latest/events/online-event-registration/
Waitlist Cvent: https://support.cvent.com/s/communityarticle/Managing-Waitlisted-Invitees

## Repos de apoyo y discovery
| Repo | Qué es | Robable |
|---|---|---|
| HiEventsDev/Hi.Events | OSS tipo Eventbrite completo | data model + check-in QR (no levantar, solo leer) |
| zhravan/rsvp2go | RSVP self-host Cloudflare Workers | esquema mínimo RSVP edge $0 |
| gath.io | Event planner Node, RSVP email | flujo simple sin login |
| crafter-station/vibecode-fest-badges | Next+Trigger+Drizzle, badge→WhatsApp | capa badge (satori + entrega WhatsApp) |
| GitHub topic event-registration | varios Next.js+Postgres | comparar schemas |

Links:
- https://github.com/hieventsdev/hi.events
- https://github.com/zhravan/rsvp2go
- https://github.com/crafter-station/vibecode-fest-badges
- https://github.com/topics/event-registration

## Stack badge/certificado (todo OSS/free)
- **satori** + **@vercel/og** → JSX a PNG (badge/cert con código)
- **pdf-lib / react-pdf** → certificado PDF imprimible
- **qrcode** → QR check-in (token único, no el guest_id)
- **Resend** free 3k emails/mes → canal email
- **wa.me** gratis (manual) / Twilio-Meta API (pago) → WhatsApp
- **Supabase** free → DB + estados
- **Vercel** free → deploy

## Jerga aclarada
- email marketing nº máximo = límite correos/mes del plan
- difusión automática = blast emails auto
- curaciones = aprobar manual quién entra
- certificados = PDF asistencia (Luma NO nativo)
- integraciones Luma = Zapier/API (requiere Plus)
