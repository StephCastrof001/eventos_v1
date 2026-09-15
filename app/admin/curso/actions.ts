"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase/server";

/**
 * Marca o desmarca a un inscrito como pagado.
 *
 * Es el testimonio de la persona que miró la captura del Yape en su WhatsApp,
 * no una verificación del sistema: acá nunca entra un sol. La fuente de verdad
 * del dinero sigue siendo ese chat; esta tabla es la vista de su trabajo.
 *
 * El campo es un booleano sin autor ni hora, por decisión explícita
 * (ADR-0002 de eventos_v3). Desmarcar no deja rastro.
 */
export async function marcarPagado(
	inscritoId: string,
	slug: string,
	pagado: boolean,
): Promise<void> {
	await requireAdmin();
	const sb = createAdminSupabase();

	const { error } = await sb
		.from("inscritos")
		.update({ pagado })
		.eq("id", inscritoId);

	if (error) throw new Error("No se pudo actualizar el pago");

	revalidatePath(`/admin/curso/${slug}`);
}
