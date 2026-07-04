# Customer Journey — Plataforma de Eventos HACK IA

> App propia (Next.js + Supabase). **NO Luma** (ver decisión en `CLAUDE.md`).
> Diagrama editable: pega el bloque ` ```mermaid ` en https://mermaid.live

## Leyenda
- ✅ **Construido y funcionando**
- ⏳ **Pendiente** (en backlog)
- 🔜 **Futuro** (fuera del scope actual)

---

## Diagrama — journey + estado de `status`

```mermaid
flowchart TD
    A["1. REGISTRO<br/>form: nombres, apellidos, DNI, email,<br/>tel, empresa, cargo + consentimiento<br/>status=registered ✅"]:::ok
    B{"2. CURACIÓN<br/>admin login (password + allowlist)<br/>aprueba/rechaza ✅"}:::ok
    R["rejected ✅"]:::ok
    C["3. EMAIL APROBACIÓN<br/>Resend 'Ver mi entrada →'<br/>magic link único ✅"]:::ok
    D["4. ENTRADA (QR)<br/>/badge/&lt;magic_token&gt;<br/>QR visible desde approved ✅"]:::ok
    E["5. BADGE REDES (opcional)<br/>sube foto → satori PNG sin QR<br/>status=badge_ready ✅"]:::ok
    G["6. CHECK-IN<br/>staff escanea /r/&lt;qr_token&gt; en /scan<br/>valida server, status=checked_in ✅"]:::ok
    F["RECORDATORIOS<br/>Vercel Cron 7/3/1 días ⏳"]:::pend
    J["7. CERTIFICADOS PDF<br/>post-evento 🔜"]:::fut

    A --> B
    B -->|aprueba| C
    B -->|rechaza| R
    C --> D
    D -->|opcional| E
    D --> G
    E --> G
    F -.->|antes del evento| D
    G --> J

    classDef ok fill:#1b5e20,stroke:#66bb6a,color:#fff;
    classDef pend fill:#7c5b00,stroke:#ffca28,color:#fff;
    classDef fut fill:#3a3a4a,stroke:#888,color:#fff;
```

---

## Puntos clave del diseño

- **Entrada = QR, no la foto.** El QR de check-in está disponible apenas se
  aprueba al invitado (`status=approved`). La foto es **opcional** y solo mejora
  el badge para compartir en redes. Antes la foto bloqueaba la entrada → guests
  sin foto no tenían QR (gap que resolvió S-A).
- **Un solo link para todo.** El email de aprobación lleva `/badge/<magic_token>`.
  Esa misma página: muestra el QR de entrada, permite subir foto y descargar el
  badge. No hay QR-imagen en el email — el link es la entrada.
- **`magic_token` vs `qr_token`.** El `magic_token` autentica la página
  self-service (sin cuenta). El `qr_token` va dentro del QR y se valida
  server-side en el check-in. Nunca se expone el `guest_id`.
- **Check-in staff-only.** La cámara viva vive en `/scan`, gated por
  `requireAdmin()`. Un invitado que abre `/r/<qr_token>` no ve datos; solo el
  staff logueado dispara la validación.

---

## Tokens y seguridad

| Token | Dónde | Uso | Regla |
|---|---|---|---|
| `magic_token` | email → `/badge/<token>` | página self-service (QR + foto + badge) | uno por invitado, reusado |
| `qr_token` | dentro del QR → `/r/<token>` | check-in staff | ≠ `guest_id`, valida server |

> ⚠️ Compartir `/badge/<magic_token>` en redes filtra el token (deuda #9,
> despriorizada). El badge de descarga va sin QR para mitigar.
