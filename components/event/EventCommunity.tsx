import QRCode from "qrcode";
import type { EventBrand } from "@/lib/events";

/**
 * Canales de la comunidad, con QR escaneable. Los QR viven acá y no en el mail
 * a propósito: un QR en el correo se lee desde el mismo celular que tendría que
 * escanearlo, y los clientes bloquean imágenes. En la web sí sirve — se abre en
 * la laptop y se escanea con el teléfono.
 *
 * Server Component: los QR se generan como data URI en el server, así no hay
 * request extra ni librería en el bundle del cliente.
 */

interface Canal {
	label: string;
	handle: string;
	url: string;
	emoji: string;
}

/**
 * Solo http/https salen a un href o a un QR. `events.brand` hoy lo escribe un
 * admin con service_role, pero el mismo allowlist ya vive en el template de
 * email: dejar un camino sin validar invita a que un `javascript:` entre por
 * acá el día que un formulario escriba ese campo. Un canal que no pasa se cae.
 */
function safeHttpUrl(url?: string | null): string | null {
	if (!url) return null;
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
			return null;
		return parsed.toString();
	} catch {
		return null;
	}
}

export function canalesDe(brand?: EventBrand | null): Canal[] {
	if (!brand) return [];
	const canales: Canal[] = [];

	const grupo = safeHttpUrl(brand.whatsapp_group);
	if (grupo)
		canales.push({
			label: "Grupo de WhatsApp",
			handle: "Únete a la comunidad",
			url: grupo,
			emoji: "💬",
		});

	const ig = safeHttpUrl(brand.instagram);
	if (ig)
		canales.push({
			label: "Instagram",
			handle: handleDeUrl(ig, "@"),
			url: ig,
			emoji: "📸",
		});

	const li = safeHttpUrl(brand.linkedin);
	if (li)
		canales.push({
			label: "LinkedIn",
			handle: handleDeUrl(li, ""),
			url: li,
			emoji: "💼",
		});

	return canales;
}

/** Último segmento de la URL como handle legible: .../hackia → @hackia. */
function handleDeUrl(url: string, prefijo: string): string {
	try {
		const segmentos = new URL(url).pathname.split("/").filter(Boolean);
		const ultimo = segmentos.at(-1);
		return ultimo ? `${prefijo}${ultimo}` : url;
	} catch {
		return url;
	}
}

export async function EventCommunity({ brand }: { brand?: EventBrand | null }) {
	const canales = canalesDe(brand);
	if (canales.length === 0) return null;

	const conQr = await Promise.all(
		canales.map(async (c) => ({
			...c,
			qr: await QRCode.toDataURL(c.url, {
				width: 220,
				margin: 1,
				color: { dark: "#0c0c14", light: "#ffffff" },
			}),
		})),
	);

	return (
		<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
			<h2 className="mb-1 text-lg font-bold">Conecta con HACK IA</h2>
			<p className="mb-4 text-sm text-white/50">
				Escanea el código o toca el enlace.
			</p>
			<ul className="flex flex-col gap-4">
				{conQr.map((c) => (
					<li key={c.url} className="flex items-center gap-3">
						{/* biome-ignore lint/performance/noImgElement: data URI generada en el server */}
						<img
							src={c.qr}
							alt={`Código QR de ${c.label}`}
							className="h-16 w-16 shrink-0 rounded-lg bg-white p-1"
						/>
						<div className="min-w-0">
							<p className="text-sm font-medium text-white/90">
								{c.emoji} {c.label}
							</p>
							<a
								href={c.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-[#00cfaa] hover:underline"
							>
								{c.handle} ↗
							</a>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
