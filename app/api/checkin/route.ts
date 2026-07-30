import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { decideCheckin } from "@/lib/checkin";
import type { GuestStatus } from "@/lib/guest-status";
import { createAdminSupabase } from "@/lib/supabase/server";

// Exigimos eventId para cumplir la regla C1
const bodySchema = z.object({
	qrToken: z.string().min(1),
	eventId: z.string().uuid(),
});

export async function POST(req: Request) {
	// Check-in solo staff: exige sesión admin autorizada (allowlist).
	try {
		await requireAdmin();
	} catch {
		return NextResponse.json(
			{ ok: false, error: "unauthorized" },
			{ status: 401 },
		);
	}

	try {
		const json = await req.json().catch(() => null);
		const parsed = bodySchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: "bad_request" },
				{ status: 400 },
			);
		}

		const { qrToken, eventId } = parsed.data;
		const sb = createAdminSupabase();

		// C1: Filtrar siempre por event_id
		const { data: guest, error: fetchError } = await sb
			.from("guests")
			.select("id, name, last_name, photo_url, status")
			.eq("qr_token", qrToken)
			.eq("event_id", eventId)
			.single();

		if (fetchError || !guest) {
			return NextResponse.json(
				{ ok: false, reason: "invalid_token" },
				{ status: 404 },
			);
		}

		// Lógica pura (no acoplada a DB)
		const decision = decideCheckin(guest.status as GuestStatus);

		if (!decision.ok) {
			const status = decision.error === "already" ? 409 : 403;
			return NextResponse.json(
				{
					ok: false,
					reason:
						decision.error === "already"
							? "already_checked_in"
							: decision.error,
				},
				{ status },
			);
		}

		// Transición permitida. Guardamos status + hora de ingreso (dato del día D,
		// base de la vista no-show #28). El .eq("status", guest.status) es un
		// optimistic lock: si otra caja de staff escaneó el mismo QR entre el fetch
		// y el update, esa fila ya no está en el estado esperado → 0 filas → 409.
		const { data: updated, error: updateError } = await sb
			.from("guests")
			.update({
				status: decision.next,
				checked_in_at: new Date().toISOString(),
			})
			.eq("id", guest.id)
			.eq("event_id", eventId)
			.eq("status", guest.status)
			.select("id");

		if (updateError) {
			throw updateError;
		}

		// Carrera perdida: otra caja ganó el check-in. Tratar como duplicado.
		if (!updated || updated.length === 0) {
			return NextResponse.json(
				{ ok: false, reason: "already_checked_in" },
				{ status: 409 },
			);
		}

		return NextResponse.json(
			{
				ok: true,
				guest: {
					name: guest.name,
					last_name: guest.last_name,
					photo_url: guest.photo_url,
					status: decision.next,
				},
			},
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{ ok: false, error: "server_error" },
			{ status: 500 },
		);
	}
}
