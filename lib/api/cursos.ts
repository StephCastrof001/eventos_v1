import { createAdminSupabase } from "@/lib/supabase/server";

/**
 * Lectura de las tablas del taller pago (repo eventos_v3).
 *
 * Viven en el MISMO proyecto Supabase que `events` y `guests`, en tablas
 * propias. Este archivo existe porque el admin de v1 es el único panel: quien
 * entra con la allowlist ve los eventos gratuitos y también los talleres pagos.
 * Es solo lectura, salvo la marca `pagado`.
 */

export interface TallerResumen {
	id: string;
	slug: string;
	nombre: string;
	inicio_at: string;
}

export interface InscritoRow {
	id: string;
	nombres: string;
	apellidos: string | null;
	dni: string | null;
	email: string;
	telefono: string;
	centro_labores: string | null;
	cargo: string | null;
	pagado: boolean;
	created_at: string;
}

export async function getTalleres(): Promise<TallerResumen[]> {
	const sb = createAdminSupabase();
	const { data, error } = await sb
		.from("talleres")
		.select("id, slug, nombre, inicio_at")
		.order("inicio_at", { ascending: false });

	// La tabla puede no existir todavía en un entorno donde no se corrió la
	// migración de eventos_v3. Eso no debe tumbar el panel de HACK IA.
	if (error) {
		if (error.code === "42P01" || error.code === "PGRST205") return [];
		throw error;
	}
	return (data as TallerResumen[] | null) ?? [];
}

export async function getTallerBySlug(
	slug: string,
): Promise<TallerResumen | null> {
	const sb = createAdminSupabase();
	const { data, error } = await sb
		.from("talleres")
		.select("id, slug, nombre, inicio_at")
		.eq("slug", slug)
		.maybeSingle();

	if (error) throw error;
	return (data as TallerResumen | null) ?? null;
}

export async function getInscritos(tallerId: string): Promise<InscritoRow[]> {
	const sb = createAdminSupabase();
	const { data, error } = await sb
		.from("inscritos")
		.select(
			"id, nombres, apellidos, dni, email, telefono, centro_labores, cargo, pagado, created_at",
		)
		.eq("taller_id", tallerId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return (data as InscritoRow[] | null) ?? [];
}
