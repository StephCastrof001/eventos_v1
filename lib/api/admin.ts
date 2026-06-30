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

export async function getEventGuests(eventId: string) {
	const sb = createAdminSupabase();
	const { data, error } = await sb
		.from("guests")
		.select("id, name, last_name, email, role, company, phone, dni, ruc, status, created_at")
		.eq("event_id", eventId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}
