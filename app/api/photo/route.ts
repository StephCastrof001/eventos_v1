import { NextResponse } from "next/server";
import { sendBadgeReadyEmail } from "@/lib/email";
import { getEnv } from "@/lib/env";
import { getGuestByMagicToken } from "@/lib/magic";
import { validatePhoto } from "@/lib/photo";
import { setGuestPhoto, uploadGuestPhoto } from "@/lib/storage";
import { createAdminSupabase } from "@/lib/supabase/server";
import { buildMagicUrl } from "@/lib/urls";

const CONSENT_VERSION = "v1-ley29733"; // ADR-001

// Subida de foto self-service: el invitado se autentica con su magic_token (sin cuenta).
export async function POST(req: Request) {
	const form = await req.formData().catch(() => null);
	const token = form?.get("magic_token");
	const file = form?.get("file");

	// El consentimiento (Ley 29733) ahora se da en el registro, no acá.
	if (typeof token !== "string" || !(file instanceof Blob)) {
		return NextResponse.json(
			{ ok: false, error: "bad_request" },
			{ status: 400 },
		);
	}

	const valid = validatePhoto({ type: file.type, size: file.size });
	if (!valid.ok) {
		return NextResponse.json(
			{ ok: false, error: valid.error },
			{ status: 400 },
		);
	}

	const guest = await getGuestByMagicToken(token);
	if (!guest) {
		return NextResponse.json(
			{ ok: false, error: "not_found" },
			{ status: 404 },
		);
	}
	if (guest.status !== "approved") {
		// foto solo en approved→badge_ready (D2)
		return NextResponse.json(
			{ ok: false, error: "not_approved" },
			{ status: 409 },
		);
	}

	const bytes = await file.arrayBuffer();
	const photoUrl = await uploadGuestPhoto(guest.event_id, guest.id, {
		bytes,
		type: file.type,
	});
	await setGuestPhoto(guest.id, guest.status, photoUrl, CONSENT_VERSION);

	// Email "badge listo" con link a la credencial. AWAIT (fire-and-forget se pierde
	// en serverless). El fallo NO debe romper la subida de foto.
	try {
		const env = getEnv();
		const badgeUrl = buildMagicUrl(env.NEXT_PUBLIC_APP_URL, token);
		const { data: g } = await createAdminSupabase()
			.from("guests")
			.select("email")
			.eq("id", guest.id)
			.single();
		if (g?.email) {
			await sendBadgeReadyEmail(g.email, guest.name, badgeUrl);
		}
	} catch (e) {
		console.error("[photo] badge-ready email fallo:", e);
	}

	return NextResponse.json({
		ok: true,
		photo_url: photoUrl,
		status: "badge_ready",
	});
}
