import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

/**
 * Cliente Supabase para SERVER (route handlers, server components).
 * Usa service_role → NUNCA exponer al cliente. Sin sesión persistente.
 */
export function createServerSupabase() {
	const env = getEnv();
	return createClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.SUPABASE_SERVICE_ROLE_KEY,
		{
			auth: { persistSession: false },
		},
	);
}
