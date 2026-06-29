import type { GuestStatus } from "@/lib/guest-status";

/** Fila de guest (refleja la tabla guests). */
export interface Guest {
	id: string;
	event_id: string;
	name: string;
	last_name: string | null;
	email: string;
	role: string | null;
	company: string | null;
	phone: string | null;
	dni: string | null;
	ruc: string | null;
	photo_url: string | null;
	badge_url: string | null;
	social_url: string | null;
	status: GuestStatus;
	magic_token: string;
	qr_token: string;
	qr_url: string | null;
	external_id: string | null;
	created_at: string;
	approved_at: string | null;
	checked_in_at: string | null;
}

/** Datos del formulario de registro (campos según evento). */
export interface RegisterInput {
	name: string;
	last_name?: string;
	email: string;
	role?: string;
	company?: string;
	phone?: string;
	dni?: string;
	ruc?: string;
}

/**
 * Puerto de registro (ADR-002 / C3). InhouseProvider = principal (Supabase),
 * LumaProvider = seed/plan B. El resto del sistema depende de este puerto.
 */
export interface RegistroProvider {
	register(eventId: string, input: RegisterInput): Promise<Guest>;
	getGuests(eventId: string): Promise<Guest[]>;
	approve(guestId: string): Promise<Guest>;
}
