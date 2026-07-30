import { NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/email";
import type { ReminderEmailInput } from "@/lib/email-template";
import { getEnv } from "@/lib/env";
import { formatEventDateRange } from "@/lib/format-date";
import {
	alreadySent,
	daysUntilEvent,
	dueOffset,
	parseReminderOffsets,
} from "@/lib/reminders";
import { createAdminSupabase } from "@/lib/supabase/server";
import { buildMagicUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

/** Fila de invitado que el cron necesita para armar y trackear el recordatorio. */
interface ReminderGuest {
	id: string;
	name: string;
	email: string;
	status: string;
	magic_token: string;
	reminder_sent: number[] | null;
}

/** Arma el input del email para un invitado. El CTA de badge solo si aún no lo hizo. */
function buildInput(
	guest: ReminderGuest,
	eventName: string,
	dateStr: string,
	daysBefore: number,
	agendaUrl: string,
	appUrl: string,
): ReminderEmailInput {
	const needsBadge = guest.status === "approved"; // approved = sin foto/badge todavía
	return {
		name: guest.name,
		eventName,
		dateStr,
		daysBefore,
		agendaUrl,
		badgeUrl: needsBadge ? buildMagicUrl(appUrl, guest.magic_token) : null,
	};
}

export async function GET(req: Request) {
	const env = getEnv();

	// Auth: Vercel Cron manda "Authorization: Bearer <CRON_SECRET>".
	if (!env.CRON_SECRET) {
		return NextResponse.json(
			{ error: "CRON_SECRET no configurado" },
			{ status: 500 },
		);
	}
	const auth = req.headers.get("authorization");
	if (auth !== `Bearer ${env.CRON_SECRET}`) {
		return NextResponse.json({ error: "no autorizado" }, { status: 401 });
	}

	const url = new URL(req.url);
	const testEmail = url.searchParams.get("test"); // modo prueba: manda 1 a este correo
	const dry = url.searchParams.get("dry") === "1"; // calcula pero no envía ni marca
	// force=N: fuerza el offset N (ignora la fecha real). Para probar el pipeline
	// cualquier día sin esperar al 10/5/1. Solo con CRON_SECRET, no es público.
	const forceRaw = url.searchParams.get("force");
	const force = forceRaw ? Number.parseInt(forceRaw, 10) : null;

	const sb = createAdminSupabase();
	const now = new Date();
	const offsets = parseReminderOffsets(env.REMINDER_OFFSETS);
	const appUrl = env.NEXT_PUBLIC_APP_URL;

	// Eventos futuros con fecha
	const { data: events, error: evErr } = await sb
		.from("events")
		.select("id, slug, name, event_date, end_date")
		.not("event_date", "is", null)
		.gte("event_date", now.toISOString());
	if (evErr) {
		return NextResponse.json({ error: evErr.message }, { status: 500 });
	}

	const results: Array<Record<string, unknown>> = [];

	for (const ev of events ?? []) {
		const daysUntil = daysUntilEvent(new Date(ev.event_date), now);
		// force gana sobre la fecha real; si no, el offset que toca hoy (o null).
		const offset =
			force !== null && Number.isInteger(force)
				? force
				: dueOffset(daysUntil, offsets);
		if (offset === null) {
			results.push({
				event: ev.slug,
				daysUntil,
				skipped: "hoy no toca offset",
			});
			continue;
		}

		const dateStr = formatEventDateRange(ev.event_date, ev.end_date);
		const agendaUrl = `${appUrl.replace(/\/$/, "")}/e/${ev.slug}#agenda`;

		// Modo prueba: manda UN correo de muestra, sin tocar DB.
		if (testEmail) {
			const sample: ReminderEmailInput = {
				name: "Prueba",
				eventName: ev.name,
				dateStr,
				daysBefore: offset,
				agendaUrl,
				badgeUrl: null,
			};
			const r = await sendReminderEmail(testEmail, sample);
			results.push({
				event: ev.slug,
				offset,
				test: testEmail,
				ok: r.ok,
				error: r.error,
			});
			continue;
		}

		// Candidatos: aprobados o con badge, no check-in / rechazados (filtrado por status).
		const { data: guests, error: gErr } = await sb
			.from("guests")
			.select("id, name, email, status, magic_token, reminder_sent")
			.eq("event_id", ev.id)
			.in("status", ["approved", "badge_ready"]);
		if (gErr) {
			results.push({ event: ev.slug, error: gErr.message });
			continue;
		}

		let sent = 0;
		let failed = 0;
		for (const g of (guests ?? []) as ReminderGuest[]) {
			const already = g.reminder_sent ?? [];
			if (alreadySent(already, offset)) continue;

			if (dry) {
				sent++;
				continue;
			}

			const input = buildInput(g, ev.name, dateStr, offset, agendaUrl, appUrl);
			const r = await sendReminderEmail(g.email, input);
			if (!r.ok) {
				failed++;
				continue;
			}
			// Marca el offset como enviado (idempotencia).
			await sb
				.from("guests")
				.update({ reminder_sent: [...already, offset] })
				.eq("id", g.id);
			sent++;
		}

		results.push({ event: ev.slug, offset, sent, failed, dry });
	}

	return NextResponse.json({ ok: true, ran_at: now.toISOString(), results });
}
