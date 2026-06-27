# Customer Journey — Evento 50 invitados (badges + certificados)

> Diagrama editable. Pegá el bloque ` ```mermaid ` en https://mermaid.live
> o https://draw.io (Arrange > Insert > Advanced > Mermaid) para moverlo visual.

## Leyenda
- 🟢 **LUMA free lo cubre**
- 🟡 **LUMA parcial** (lo hace pero limitado/manual)
- 🔴 **LUMA NO** → necesita otra herramienta
- 🔒 **Requiere Luma Plus** (~$59/mes) si querés automatizar vía API

---

## Diagrama (state machine + cobertura Luma)

```mermaid
flowchart TD
    A["1. DESCUBRIMIENTO<br/>landing evento<br/>🟢 Luma free"]:::luma
    B["2. REGISTRO ASISTENTE<br/>form: nombre,email,rol,FOTO<br/>🟡 Luma free (foto/custom limitado)"]:::partial
    C{"3. CURACION / APROBACION<br/>organizador revisa<br/>🟢 Luma free (approval ON)"}:::luma
    D["3b. RECHAZO / WAITLIST<br/>🟢 Luma free (waitlist)"]:::luma
    E["4. CONFIRMADO<br/>email 'estas dentro'<br/>🟢 Luma free"]:::luma
    F["5. RECORDATORIOS<br/>T-24h / T-2h<br/>🟢 Luma free (email)"]:::luma
    G["6. GEN BADGE<br/>foto+branding+QR+nombre<br/>🔴 Luma NO -> satori propio"]:::nope
    H["7. ENVIO BADGE multicanal<br/>email + WhatsApp + link<br/>🔴 WhatsApp NO / email basico"]:::nope
    I["8. CHECK-IN QR<br/>escanea puerta, valida<br/>🟢 Luma app (o propio)"]:::luma
    J["9. CERTIFICADOS<br/>PDF asistencia post-evento<br/>🔴 Luma NO -> gen propio"]:::nope
    K["10. DIFUSION / FOLLOW-UP / ANALYTICS<br/>🟡 Luma free (analytics basico)<br/>🔒 automatizar = Plus"]:::partial

    A --> B --> C
    C -->|aprueba| E
    C -->|rechaza/lleno| D
    E --> F --> G --> H --> I --> J --> K
    D -.->|libera cupo| E

    classDef luma fill:#1b5e20,stroke:#66bb6a,color:#fff;
    classDef partial fill:#7c5b00,stroke:#ffca28,color:#fff;
    classDef nope fill:#7f1d1d,stroke:#ef5350,color:#fff;
```

---

## Frontera Luma (resumen)

| Etapa | Luma free | Necesita otra tool |
|---|---|---|
| 1 Descubrimiento | ✅ | — |
| 2 Registro + foto | ⚠️ básico | form propio si querés foto/branding |
| 3 Curación/aprobación | ✅ | — |
| 3b Rechazo/waitlist | ✅ | — |
| 4 Confirmado | ✅ | — |
| 5 Recordatorios | ✅ | — |
| **6 Badge (foto+QR)** | ❌ | **satori (propio)** |
| **7 Envío multicanal** | ❌ WhatsApp | **Resend + wa.me/Twilio** |
| 8 Check-in QR | ✅ app Luma | propio si querés dashboard custom |
| **9 Certificados PDF** | ❌ | **gen propio (satori/pdf-lib)** |
| 10 Difusión/analytics | ⚠️ básico | 🔒 API (Plus) o tool propia |

**Luma free te cubre 1–5 + 8.** Lo que SÍ o SÍ construyes: **6, 7, 9** (badge, envío WhatsApp, certificados).

---

## Decisión de arquitectura (según presupuesto)

- **Opción $0:** Luma free para 1–5 + 8 → export CSV manual → tu app (Next.js + satori) hace 6,7,9.
  - Contra: CSV manual, sin tiempo-real, sin API.
- **Opción Plus ($59/mes):** API conecta todo, tiempo-real, badge/cert auto al confirmar.
- **Opción sin Luma:** form propio (Tally free webhook) → tu app hace TODO el journey. $0 + tiempo-real, pero construís registro.
