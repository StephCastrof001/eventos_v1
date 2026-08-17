import { createAdminSupabase } from "@/lib/supabase/server";

/** Campo configurable del formulario por evento (P2). */
export interface FormField {
	key: string;
	label: string;
	type: "text" | "email" | "tel" | "number";
	required: boolean;
}

/** Panel/charla de la agenda del evento (Bloque C). */
export interface AgendaItem {
	time: string; // ej. "19:00"
	title: string;
	speaker?: string | null;
	role?: string | null;
	photo_url?: string | null;
}

/**
 * Canales de la comunidad organizadora. Viven en `events.brand` (JSONB) para
 * que cada evento traiga los suyos sin tocar código. Todos opcionales: un
 * evento sin redes simplemente no muestra el bloque.
 */
export interface EventBrand {
	whatsapp_group?: string | null;
	instagram?: string | null;
	linkedin?: string | null;
}

/** Evento (datos públicos). */
export interface EventRow {
	id: string;
	slug: string;
	name: string;
	event_date?: string | null;
	end_date?: string | null;
	location_type?: string | null;
	location?: string | null;
	location_url?: string | null;
	instructions?: string | null;
	description?: string | null;
	organizer?: string | null;
	brand?: EventBrand | null;
	agenda?: AgendaItem[];
	form_fields: FormField[];
}

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
	const sb = createAdminSupabase();
	let { data, error } = await sb
		.from("events")
		.select(
			"id, slug, name, event_date, end_date, location_type, location, location_url, instructions, description, organizer, brand, agenda, form_fields",
		)
		.eq("slug", slug)
		.maybeSingle();

	// Fallback si las nuevas columnas no existen en DB
	if (error && error.code === "42703") {
		const fallback = await sb
			.from("events")
			.select(
				"id, slug, name, event_date, location, location_url, description, organizer, form_fields",
			)
			.eq("slug", slug)
			.maybeSingle();

		if (fallback.error && fallback.error.code === "42703") {
			// Segundo fallback (si tampoco existe location_url)
			const fallback2 = await sb
				.from("events")
				.select(
					"id, slug, name, event_date, location, description, organizer, form_fields",
				)
				.eq("slug", slug)
				.maybeSingle();
			data = fallback2.data as typeof data;
			error = fallback2.error;
		} else {
			data = fallback.data as typeof data;
			error = fallback.error;
		}
	}

	if (error) throw error;
	const event = data as EventRow | null;

	return event;
}
