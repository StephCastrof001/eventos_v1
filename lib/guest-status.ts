/**
 * Estados del invitado y máquina de transiciones (CONTEXT.md v0.3).
 *
 *   registered ─(admin aprueba)─> approved ─(sube foto)─> badge_ready ─(scan)─> checked_in
 *        └─(admin rechaza)─> rejected        (canceled: el invitado se baja)
 *
 * Sin cupo/waitlist (P7). Sin certificado (v2). Foto gatea approved→badge_ready (app).
 */
export type GuestStatus =
	| "registered"
	| "approved"
	| "badge_ready"
	| "checked_in"
	| "rejected"
	| "canceled";

/** Transiciones válidas: from → conjunto de destinos permitidos. */
const TRANSITIONS: Record<GuestStatus, readonly GuestStatus[]> = {
	registered: ["approved", "rejected", "canceled"],
	approved: ["badge_ready", "rejected", "canceled"],
	badge_ready: ["checked_in", "canceled"],
	checked_in: [],
	rejected: [],
	canceled: [],
};

/** ¿Es válida la transición from → to? Única fuente de verdad. */
export function canTransition(from: GuestStatus, to: GuestStatus): boolean {
	return TRANSITIONS[from].includes(to);
}

/** Aplica la transición o lanza si es inválida (no saltar estados). */
export function transition(from: GuestStatus, to: GuestStatus): GuestStatus {
	if (!canTransition(from, to)) {
		throw new Error(`Transición inválida: ${from} → ${to}`);
	}
	return to;
}
