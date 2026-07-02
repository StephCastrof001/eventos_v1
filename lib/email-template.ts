export interface ApprovalEmailInput {
	name: string;
	magicUrl: string;
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
    <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Tu solicitud fue aprobada. Generá tu credencial de acceso con el botón:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:10px; background-color:#6f5ff2;">
      <a href="${safeUrl}" style="display:inline-block; padding:14px 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:10px;">Ver mi credencial →</a>
    </td></tr></table>
    <p style="margin:24px 0 0 0; font-size:12px; line-height:1.5; color:#6b6b80;">Si el botón no funciona, copiá este enlace:<br><span style="color:#9a9ab0;">${safeUrl}</span></p>`;

	return {
		subject:
			"✅ Aprobado — tu entrada para la inauguración de la comunidad HACK IA",
		html: emailShell("Tu solicitud fue aprobada. Generá tu credencial.", body),
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
    <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:#c9c9d6;">Tu credencial con QR ya está lista. Abrila desde el botón: mostrás el QR en la puerta para tu check-in y podés descargar tu versión (sin QR) para compartir en redes.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:10px; background-color:#6f5ff2;">
      <a href="${safeUrl}" style="display:inline-block; padding:14px 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:10px;">Ver mi credencial →</a>
    </td></tr></table>
    <p style="margin:24px 0 0 0; font-size:12px; line-height:1.5; color:#6b6b80;">Si el botón no funciona, copiá este enlace:<br><span style="color:#9a9ab0;">${safeUrl}</span></p>`;

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

	let dateStr = "";
	if (eventDate) {
		const startD = new Date(eventDate);
		dateStr = startD.toLocaleDateString("es-PE", {
			weekday: "long",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
		if (endDate) {
			const endD = new Date(endDate);
			if (startD.toLocaleDateString() === endD.toLocaleDateString()) {
				dateStr += ` - ${endD.toLocaleTimeString("es-PE", {
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			} else {
				dateStr += ` hasta ${endD.toLocaleDateString("es-PE", {
					weekday: "long",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			}
		}
	}

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
