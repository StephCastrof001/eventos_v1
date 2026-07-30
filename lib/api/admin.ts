import { createAdminSupabase } from "@/lib/supabase/server";

export async function getEvents() {
	const sb = createAdminSupabase();
	const { data, error } = await sb
		.from("events")
		.select("id, slug, name")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

/** Fila de bitácora tal como la muestra el panel. */
export interface ReminderLogEntry {
	id: string;
	email: string;
	offset_days: number;
	ok: boolean;
	provider_id: string | null;
	error: string | null;
	sent_at: string;
	guests: { name: string | null } | null;
}

/**
 * Bitácora de recordatorios de un evento, lo más reciente primero.
 * Incluye los intentos fallidos: son justamente los que hay que mirar.
 */
export async function getReminderLog(
	eventId: string,
	limit = 200,
): Promise<ReminderLogEntry[]> {
	const sb = createAdminSupabase();
	const { data, error } = await sb
		.from("reminder_log")
		.select(
			"id, email, offset_days, ok, provider_id, error, sent_at, guests(name)",
		)
		.eq("event_id", eventId)
		.order("sent_at", { ascending: false })
		.limit(limit);

	if (error) throw error;
	return (data ?? []) as unknown as ReminderLogEntry[];
}

export async function getEventGuests(eventId: string) {
	const sb = createAdminSupabase();
	const { data, error } = await sb
		.from("guests")
		.select(
			"id, name, last_name, email, role, company, phone, dni, ruc, status, created_at",
		)
		.eq("event_id", eventId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}
