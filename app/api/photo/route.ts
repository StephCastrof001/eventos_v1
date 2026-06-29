import { NextResponse } from "next/server";
import { getGuestByMagicToken } from "@/lib/magic";
import { validatePhoto } from "@/lib/photo";
import { setGuestPhoto, uploadGuestPhoto } from "@/lib/storage";

const CONSENT_VERSION = "v1-ley29733"; // ADR-001

// Subida de foto self-service: el invitado se autentica con su magic_token (sin cuenta).
export async function POST(req: Request) {
	const form = await req.formData().catch(() => null);
	const token = form?.get("magic_token");
	const consent = form?.get("consent");
	const file = form?.get("file");

	if (typeof token !== "string" || !(file instanceof Blob)) {
		return NextResponse.json(
			{ ok: false, error: "bad_request" },
			{ status: 400 },
		);
	}
	if (consent !== "true") {
		return NextResponse.json(
			{ ok: false, error: "consent_required" },
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

	return NextResponse.json({
		ok: true,
		photo_url: photoUrl,
		status: "badge_ready",
	});
}
