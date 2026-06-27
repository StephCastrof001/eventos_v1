# Customer Journey — Timeline Evento (50 invitados)

> Este gráfico se dibuja solo en **GitHub**, **mermaid.live**, **Notion**, **VS Code** (extensión Mermaid).
> Día del evento = **D (2026-08-01, ejemplo)**. Cambiá las fechas y se reacomoda.
> 🔴 Tareas en rojo (`crit`) = Luma NO lo hace, lo construís vos.

## Timeline (gantt)

```mermaid
gantt
    title Customer Journey - Evento Badges + Certificados
    dateFormat YYYY-MM-DD
    axisFormat %d-%b

    section Luma free cubre
    1 Descubrimiento landing      :done, des, 2026-07-02, 28d
    2 Registro asistentes         :done, reg, 2026-07-02, 20d
    3 Curacion / aprobacion       :done, cur, 2026-07-23, 2d
    4 Confirmado (email)          :done, con, 2026-07-24, 1d
    7 Recordatorios               :done, rem, 2026-07-30, 2d
    8 Check-in QR (dia evento)    :milestone, chk, 2026-08-01, 0d

    section Construyes vos (Luma NO)
    5 Generar badge foto+QR       :crit, bad, 2026-07-25, 2d
    6 Envio badge WhatsApp+email  :crit, env, 2026-07-25, 3d
    9 Certificados PDF            :crit, cer, 2026-08-03, 2d

    section Post-evento
    10 Difusion / Analytics       :active, ana, 2026-08-04, 3d
```

## Mismo journey como flujo (flowchart)

```mermaid
flowchart LR
    A["1 Descubrimiento<br/>D-30"] --> B["2 Registro<br/>D-30 a D-10"]
    B --> C{"3 Curacion<br/>D-9"}
    C -->|aprueba| D["4 Confirmado<br/>D-8"]
    C -->|rechaza| X["3b Rechazo/Waitlist<br/>D-8"]
    D --> E["5 Badge<br/>D-7"]:::propio
    E --> F["6 Envio multicanal<br/>D-7"]:::propio
    F --> G["7 Recordatorios<br/>D-2"]
    G --> H["8 Check-in QR<br/>Dia D"]
    H --> I["9 Certificados<br/>D+2"]:::propio
    I --> J["10 Difusion/Analytics<br/>D+3"]

    classDef propio fill:#7f1d1d,stroke:#ef5350,color:#fff;
```

## Cómo verlo como gráfico (sin tocar nada)

1. **mermaid.live** — pegás el bloque ` ```mermaid ` → lo ves al toque, exportás PNG/SVG.
2. **GitHub** — subís este .md a un repo → se dibuja solo al abrirlo.
3. **VS Code** — instalá extensión "Markdown Preview Mermaid Support" → preview.
4. **Notion** — bloque `/code` lenguaje Mermaid → pegás.
