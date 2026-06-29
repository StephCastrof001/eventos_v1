import { createServerSupabase } from "@/lib/supabase/server";

/** Campo configurable del formulario por evento (P2). */
export interface FormField {
	key: string;
	label: string;
	type: "text" | "email" | "tel" | "number";
	required: boolean;
}

/** Evento (datos públicos). */
export interface EventRow {
	id: string;
	slug: string;
	name: string;
	event_date: string | null;
	location: string | null;
	description: string | null;
	organizer: string | null;
	form_fields: FormField[];
}

/** Lee un evento por slug (server). Null si no existe. */
export async function getEventBySlug(slug: string): Promise<EventRow | null> {
	const sb = createServerSupabase();
	const { data, error } = await sb
		.from("events")
		.select(
			"id, slug, name, event_date, location, description, organizer, form_fields",
		)
		.eq("slug", slug)
		.maybeSingle();
	if (error) throw error;
	return (data as EventRow | null) ?? null;
}
