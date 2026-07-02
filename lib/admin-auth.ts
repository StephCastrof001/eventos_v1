import { getEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Exige admin AUTORIZADO (no solo autenticado): sesión válida + email en la allowlist.
 * Supabase permite signups públicos por default, así que "logueado" ≠ "admin".
 * Las mutaciones usan service_role (bypassa RLS) → el gate de autorización vive acá.
 * Lanza "No autorizado" si falla. Compartido por server actions y route handlers.
 */
export async function requireAdmin(): Promise<void> {
	const auth = await createServerSupabase();
	const {
		data: { user },
	} = await auth.auth.getUser();
	// email_confirmed_at: evita spoofing de email no verificado contra la allowlist.
	if (!user?.email || !user.email_confirmed_at) {
		throw new Error("No autorizado");
	}

	const allowed = getEnv()
		.ADMIN_EMAILS.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (!allowed.includes(user.email.toLowerCase())) {
		throw new Error("No autorizado");
	}
}
