import type { GuestStatus } from "@/lib/guest-status";

export type CheckinResult =
	| { ok: true; next: "checked_in" }
	| { ok: false; error: "invalid" | "already" | "not_approved" };

export function decideCheckin(current: GuestStatus | null): CheckinResult {
	if (current === null) {
		return { ok: false, error: "invalid" };
	}
	if (current === "checked_in") {
		return { ok: false, error: "already" };
	}
	// La foto es opcional: se puede hacer check-in desde approved (sin badge)
	// o desde badge_ready (subió foto). El QR/entrada vale desde la aprobación.
	if (current === "approved" || current === "badge_ready") {
		return { ok: true, next: "checked_in" };
	}
	return { ok: false, error: "not_approved" };
}
