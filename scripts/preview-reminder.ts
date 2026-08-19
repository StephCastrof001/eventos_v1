/**
 * Previsualiza el email de recordatorio con los datos REALES del evento en DB,
 * sin mandar nada. Uso:
 *
 *   node_modules/.bin/jiti scripts/preview-reminder.ts 0    # 0 = "es hoy"
 *
 * Escribe el HTML en .preview/reminder-<offset>.html para abrirlo en el
 * navegador. Existe porque el copy cambia según cuánto falta (0 / 1 / N) y la
 * única forma honesta de aprobarlo es verlo renderizado, no leer el string.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildReminderEmail } from "../lib/email-template";
import { formatEventDateRange } from "../lib/format-date";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = Object.fromEntries(
	readFileSync(join(root, ".env"), "utf8")
		.split("\n")
		.filter((l) => l.includes("=") && !l.trim().startsWith("#"))
		.map((l) => {
			const i = l.indexOf("=");
			return [l.slice(0, i).trim(), l.slice(i + 1).trim()] as const;
		}),
);

async function main() {
	const offset = Number.parseInt(process.argv[2] ?? "0", 10);

	const res = await fetch(
		`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/events?select=*&limit=1`,
		{
			headers: {
				apikey: env.SUPABASE_SERVICE_ROLE_KEY,
				Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
			},
		},
	);
	const [ev] = await res.json();
	if (!ev) throw new Error("no hay eventos en la DB");

	const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
	const { subject, html } = buildReminderEmail({
		name: "Stephanie",
		eventName: ev.name,
		dateStr: formatEventDateRange(ev.event_date, ev.end_date),
		daysBefore: offset,
		agendaUrl: `${appUrl}/e/${ev.slug}/agenda`,
		entradaUrl: `${appUrl}/badge/token-de-ejemplo`,
		location: ev.location,
		locationUrl: ev.location_url,
		instructions: ev.instructions,
		community: ev.brand,
	});

	const outDir = join(root, ".preview");
	mkdirSync(outDir, { recursive: true });
	const out = join(outDir, `reminder-${offset}.html`);
	writeFileSync(out, html, "utf8");

	console.log(`offset  : ${offset}`);
	console.log(`subject : ${subject}`);
	console.log(`archivo : ${out}`);
}

main();
