import { formatEventDateRange } from "./format-date";

export interface ApprovalEmailInput {
	name: string;
	magicUrl: string;
}

/**
 * Normaliza nombres gritados o en minúsculas que vienen del formulario:
 * "STEPHANIE" → "Stephanie", "jose perez" → "Jose Perez". Un nombre con
 * mayúsculas mezcladas ("McDonald", "de la Cruz") se deja intacto: ahí el
 * usuario ya eligió cómo escribirlo.
 */
function normalizeName(name: string): string {
	const mixed = name !== name.toUpperCase() && name !== name.toLowerCase();
	if (mixed) return name;
	return name
		.toLowerCase()
		.replace(
			/(^|[\s'-])(\p{L})/gu,
			(_, sep, letter) => sep + letter.toUpperCase(),
		);
}

function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Shell de marca HACK IA para emails. Email-safe: estilos inline, sin flexbox ni
 * gradientes (los clientes los rompen). Wordmark en texto (no imagen) para evitar
 * imágenes bloqueadas. `preheader` = texto de preview en la bandeja.
 */
function emailShell(preheader: string, body: string): string {
	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HACK IA</title>
</head>
<body style="margin:0; padding:0; background-color:#0c0c14;">
  <span style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0c14; padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#14141f; border:1px solid #2a2a3a; border-radius:16px; overflow:hidden;">
        <tr><td style="padding:28px 32px 0 32px; text-align:center;">
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:22px; font-weight:bold; letter-spacing:1px; color:#e8e8f0;">HACK<span style="color:#6f5ff2;"> IA</span></div>
          <div style="height:3px; width:44px; background-color:#00cfaa; border-radius:2px; margin:12px auto 0 auto;"></div>
        </td></tr>
        <tr><td style="padding:24px 32px 32px 32px; font-family:Arial,Helvetica,sans-serif; color:#e8e8f0;">
          ${body}
        </td></tr>
      </table>
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#6b6b80; margin-top:16px;">Comunidad HACK IA</div>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildApprovalEmail(input: ApprovalEmailInput): {
	subject: string;
	html: string;
} {
	const safeName = escapeHtml(input.name);

	// valida esquema (solo http/https) y escapa la URL en contexto de atributo
	const parsed = new URL(input.magicUrl);
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
		throw new Error("magicUrl: esquema no permitido");
	}
	const safeUrl = escapeHtml(parsed.toString());

	const body = `
    <h1 style="margin:0 0 16px 0; font-size:24px; color:#e8e8f0;">¡Estás dentro! 🎉</h1>
    <p style="margin:0 0 12px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Hola <strong style="color:#e8e8f0;">${safeName}</strong>,</p>
    <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Tu solicitud fue aprobada. Aquí tienes tu entrada con QR: muéstrala en la puerta para tu ingreso. Ábrela con el botón:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:10px; background-color:#6f5ff2;">
      <a href="${safeUrl}" style="display:inline-block; padding:14px 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:10px;">Ver mi entrada →</a>
    </td></tr></table>
    <p style="margin:24px 0 0 0; font-size:12px; line-height:1.5; color:#6b6b80;">Si el botón no funciona, copia este enlace:<br><span style="color:#9a9ab0;">${safeUrl}</span></p>`;

	return {
		subject:
			"✅ Aprobado — tu entrada para la inauguración de la comunidad HACK IA",
		html: emailShell("Tu solicitud fue aprobada. Aquí está tu entrada.", body),
	};
}

export interface BadgeReadyEmailInput {
	name: string;
	badgeUrl: string;
}

/**
 * Email "tu badge está listo" — se envía al pasar a badge_ready (subió foto).
 * Lleva a la página del badge (QR en pantalla + descarga sin QR). Mismo shell branded.
 */
export function buildBadgeReadyEmail(input: BadgeReadyEmailInput): {
	subject: string;
	html: string;
} {
	const safeName = escapeHtml(input.name);

	const parsed = new URL(input.badgeUrl);
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
		throw new Error("badgeUrl: esquema no permitido");
	}
	const safeUrl = escapeHtml(parsed.toString());

	const body = `
    <h1 style="margin:0 0 16px 0; font-size:24px; color:#e8e8f0;">Tu badge está listo 🎫</h1>
    <p style="margin:0 0 12px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Hola <strong style="color:#e8e8f0;">${safeName}</strong>,</p>
    <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Tu badge con QR ya está listo. Ábrelo desde el botón: muestras el QR en la puerta para tu check-in y puedes descargar tu versión (sin QR) para compartir en redes.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:10px; background-color:#6f5ff2;">
      <a href="${safeUrl}" style="display:inline-block; padding:14px 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:10px;">Ver mi credencial →</a>
    </td></tr></table>
    <p style="margin:24px 0 0 0; font-size:12px; line-height:1.5; color:#6b6b80;">Si el botón no funciona, copia este enlace:<br><span style="color:#9a9ab0;">${safeUrl}</span></p>`;

	return {
		subject: "🎫 Tu badge está listo — HACK IA",
		html: emailShell("Tu credencial con QR ya está lista.", body),
	};
}

export function buildPendingEmail(
	name: string,
	eventName: string,
	eventDate?: string | null,
	eventLocation?: string | null,
	locationUrl?: string | null,
	endDate?: string | null,
	locationType?: string | null,
	instructions?: string | null,
): {
	subject: string;
	html: string;
} {
	const safeName = escapeHtml(name);
	const safeEventName = escapeHtml(eventName);

	const dateStr = formatEventDateRange(eventDate, endDate);

	const locationRow = eventLocation
		? locationUrl
			? `<a href="${escapeHtml(locationUrl)}" target="_blank" style="color:#00cfaa; text-decoration:none;">📍 ${escapeHtml(eventLocation)}</a>`
			: `📍 ${escapeHtml(eventLocation)}`
		: "";

	const typeRow = locationType
		? `<span style="display:inline-block; padding:2px 10px; border-radius:999px; background-color:rgba(111,95,242,0.18); color:#b9aefc; font-size:11px; margin-bottom:8px;">${escapeHtml(locationType)}</span><br>`
		: "";

	const rows: string[] = [];
	if (dateStr)
		rows.push(
			`<p style="margin:0 0 8px 0; font-size:14px; color:#c9c9d6;">🗓️ <strong style="color:#e8e8f0;">${escapeHtml(dateStr)}</strong></p>`,
		);
	if (eventLocation)
		rows.push(
			`<p style="margin:0; font-size:14px; color:#c9c9d6;">${typeRow}${locationRow}</p>`,
		);
	if (instructions)
		rows.push(
			`<p style="margin:12px 0 0 0; font-size:13px; line-height:1.5; color:#9a9ab0;">ℹ️ ${escapeHtml(instructions)}</p>`,
		);

	const detailsHtml = rows.length
		? `<div style="margin:20px 0; padding:16px; background-color:#0c0c14; border:1px solid #2a2a3a; border-radius:10px; text-align:left;">${rows.join("")}</div>`
		: "";

	const body = `
    <h1 style="margin:0 0 16px 0; font-size:24px; color:#e8e8f0;">Solicitud recibida ✨</h1>
    <p style="margin:0 0 12px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Hola <strong style="color:#e8e8f0;">${safeName}</strong>,</p>
    <p style="margin:0 0 4px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Recibimos tu solicitud para <strong style="color:#e8e8f0;">${safeEventName}</strong>.</p>
    ${detailsHtml}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 0 0;"><tr><td style="padding:8px 14px; border-radius:999px; background-color:rgba(0,207,170,0.12); border:1px solid rgba(0,207,170,0.3);">
      <span style="font-size:13px; color:#00cfaa; font-weight:bold;">⏳ Pendiente de aprobación</span>
    </td></tr></table>
    <p style="margin:20px 0 0 0; font-size:14px; line-height:1.6; color:#9a9ab0;">Te avisamos por este medio cuando aprobemos tu acceso, con tu entrada oficial.</p>`;

	return {
		subject: `Solicitud recibida — ${safeEventName}`,
		html: emailShell(
			`Recibimos tu solicitud para ${safeEventName}. Está pendiente de aprobación.`,
			body,
		),
	};
}

export interface ReminderEmailInput {
	name: string;
	eventName: string;
	/** Fecha ya formateada, ej. "miércoles 19 de agosto, 19:00 - 21:00". */
	dateStr: string;
	/** Días restantes al evento. Valores esperados: 10 | 5 | 1. */
	daysBefore: number;
	/** URL a la agenda del evento; genera el botón "Ver agenda". */
	agendaUrl: string;
	/** Si viene, incluye CTA "Haz tu credencial"; si null/undefined, omite el bloque. */
	badgeUrl?: string | null;
	/** Dirección del evento. Un recordatorio sin el "dónde" obliga a buscarlo aparte. */
	location?: string | null;
	/** Link al pin en Maps; si viene, la dirección se vuelve clickeable. */
	locationUrl?: string | null;
	/**
	 * Logística del evento (check-in, puntualidad, estacionamiento), una línea
	 * por dato. Viene de `events.instructions`: es data, no copy hardcodeado,
	 * así cada evento pone la suya y se edita sin deploy.
	 */
	instructions?: string | null;
	/**
	 * Canales de la comunidad (`events.brand`). En el mail van como links, no
	 * como QR: el QR se leería desde el mismo celular que abre el correo, y los
	 * clientes bloquean imágenes. Los QR viven en la página de agenda.
	 */
	community?: {
		whatsapp_group?: string | null;
		instagram?: string | null;
		linkedin?: string | null;
	} | null;
}

/**
 * Email de recordatorio al evento (10/5/1 días antes).
 * Reutiliza emailShell y escapeHtml del módulo. Valida esquemas URL (http/https).
 */
export function buildReminderEmail(input: ReminderEmailInput): {
	subject: string;
	html: string;
} {
	const safeName = escapeHtml(normalizeName(input.name));
	const safeEventName = escapeHtml(input.eventName);
	const safeDateStr = escapeHtml(input.dateStr);

	const parsedAgenda = new URL(input.agendaUrl);
	if (parsedAgenda.protocol !== "https:" && parsedAgenda.protocol !== "http:") {
		throw new Error("agendaUrl: esquema no permitido");
	}
	const safeAgendaUrl = escapeHtml(parsedAgenda.toString());

	// La víspera merece su propio tono; el resto comparte el "faltan pocos días".
	const esVispera = input.daysBefore === 1;
	const subject = esVispera
		? `Mañana nos vemos — ${input.eventName}`
		: `Nos vemos en el ${input.eventName}`;
	const titulo = esVispera
		? "¡Mañana nos vemos! 🚀"
		: "Nos vemos muy pronto 🚀";
	const intro = esVispera
		? "Es mañana. Queremos que tengas todo listo para disfrutar al máximo esta experiencia."
		: "Estamos a solo unos días de vivir esta experiencia y queremos que llegues con todo listo.";

	const badgeCtaHtml = buildBadgeCta(input.badgeUrl);
	const locationHtml = buildLocationRow(input.location, input.locationUrl);
	const instructionsHtml = buildInstructionsRows(input.instructions);

	const body = `
    <h1 style="margin:0 0 16px 0; font-size:24px; color:#e8e8f0;">${titulo}</h1>
    <p style="margin:0 0 12px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">¡Hola <strong style="color:#e8e8f0;">${safeName}</strong>!</p>
    <p style="margin:0 0 12px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">${intro}</p>
    <p style="margin:0 0 4px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Estos son los detalles más importantes para tu asistencia:</p>
    <div style="margin:20px 0; padding:16px; background-color:#0c0c14; border:1px solid #2a2a3a; border-radius:10px; text-align:left;">
      <p style="margin:0; font-size:14px; color:#c9c9d6;">🗓️ <strong style="color:#e8e8f0;">${safeDateStr}</strong></p>${locationHtml}${instructionsHtml}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:10px; background-color:#6f5ff2;">
      <a href="${safeAgendaUrl}" style="display:inline-block; padding:14px 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:10px;">Ver ponentes y agenda →</a>
    </td></tr></table>
    ${badgeCtaHtml}
    ${buildCommunityBlock(input.community)}
    <p style="margin:28px 0 0 0; font-size:15px; line-height:1.6; color:#c9c9d6;">¡Nos vemos muy pronto!</p>
    <p style="margin:4px 0 0 0; font-size:15px; line-height:1.6; color:#9a9ab0;">Con cariño,<br><strong style="color:#e8e8f0;">Comunidad HACK IA</strong></p>`;

	return {
		subject,
		html: emailShell(`${intro} ${safeEventName}`, body),
	};
}

/** URL segura para atributo href, o null si el esquema no es http/https. */
function safeHref(url?: string | null): string | null {
	if (!url) return null;
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
			return null;
		return escapeHtml(parsed.toString());
	} catch {
		return null;
	}
}

/**
 * Bloque de comunidad al pie del recordatorio. El grupo de WhatsApp es la
 * acción con más peso (botón); Instagram y LinkedIn quedan como links chicos
 * para no competir con el CTA principal de la agenda.
 */
function buildCommunityBlock(
	community: ReminderEmailInput["community"],
): string {
	const grupo = safeHref(community?.whatsapp_group);
	const ig = safeHref(community?.instagram);
	const li = safeHref(community?.linkedin);
	if (!grupo && !ig && !li) return "";

	const grupoHtml = grupo
		? `
    <p style="margin:0 0 10px 0; font-size:14px; line-height:1.6; color:#c9c9d6;">Únete a la comunidad y entérate de todo antes que nadie:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:10px; background-color:#25D366;">
      <a href="${grupo}" style="display:inline-block; padding:12px 24px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#0c0c14; text-decoration:none; border-radius:10px;">💬 Unirme al grupo de WhatsApp →</a>
    </td></tr></table>`
		: "";

	const redes = [
		ig
			? `<a href="${ig}" style="color:#9a9ab0; text-decoration:none;">Instagram</a>`
			: null,
		li
			? `<a href="${li}" style="color:#9a9ab0; text-decoration:none;">LinkedIn</a>`
			: null,
	].filter(Boolean);
	const redesHtml = redes.length
		? `<p style="margin:14px 0 0 0; font-size:13px; color:#6b6b80; text-align:center;">${redes.join(' <span style="color:#2a2a3a;">·</span> ')}</p>`
		: "";

	return `<div style="margin:24px 0 0 0; padding:20px 0 0 0; border-top:1px solid #2a2a3a; text-align:center;">${grupoHtml}${redesHtml}</div>`;
}

/**
 * Renderiza `events.instructions` dentro de la caja de detalles: una línea por
 * renglón del texto. Se separa del bloque fecha/dirección con un filete para
 * que la logística no se confunda con el cuándo y el dónde.
 */
function buildInstructionsRows(instructions?: string | null): string {
	if (!instructions?.trim()) return "";
	const lineas = instructions
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean)
		.map(
			(l) =>
				`<p style="margin:6px 0 0 0; font-size:14px; line-height:1.5; color:#c9c9d6;">${escapeHtml(l)}</p>`,
		)
		.join("");
	return `<div style="margin:12px 0 0 0; padding:12px 0 0 0; border-top:1px solid #2a2a3a;">${lineas}</div>`;
}

/**
 * Fila de dirección del recordatorio. Si hay locationUrl válida, la dirección
 * se vuelve un link al pin de Maps. Una URL con esquema no permitido no rompe
 * el envío: se degrada a texto plano.
 */
function buildLocationRow(
	location?: string | null,
	locationUrl?: string | null,
): string {
	if (!location) return "";
	const safeLocation = escapeHtml(location);
	let href: string | null = null;
	if (locationUrl) {
		try {
			const parsed = new URL(locationUrl);
			if (parsed.protocol === "https:" || parsed.protocol === "http:") {
				href = escapeHtml(parsed.toString());
			}
		} catch {
			href = null;
		}
	}
	const inner = href
		? `<a href="${href}" target="_blank" style="color:#00cfaa; text-decoration:none;">📍 ${safeLocation}</a>`
		: `📍 ${safeLocation}`;
	return `<p style="margin:8px 0 0 0; font-size:14px; color:#c9c9d6;">${inner}</p>`;
}

/**
 * Construye el bloque HTML del CTA de credencial si badgeUrl es válida.
 * Retorna cadena vacía si badgeUrl es null/undefined.
 */
function buildBadgeCta(badgeUrl: string | null | undefined): string {
	if (badgeUrl == null) return "";

	const parsed = new URL(badgeUrl);
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
		throw new Error("badgeUrl: esquema no permitido");
	}
	const safeUrl = escapeHtml(parsed.toString());

	return `
    <p style="margin:20px 0 8px 0; font-size:14px; line-height:1.6; color:#c9c9d6;">¿Aún no tienes tu credencial? Créala antes del evento:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:10px; background-color:#00cfaa;">
      <a href="${safeUrl}" style="display:inline-block; padding:12px 24px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#0c0c14; text-decoration:none; border-radius:10px;">Haz tu credencial →</a>
    </td></tr></table>`;
}
