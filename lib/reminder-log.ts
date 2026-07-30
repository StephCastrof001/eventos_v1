/**
 * Bitácora de recordatorios (migración 0005). Lógica pura: arma las filas que
 * el cron inserta en reminder_log. Se registran los intentos exitosos y los
 * fallidos por igual — sin los fallos la bitácora miente por omisión.
 */

/** Fila tal como se guarda en reminder_log. */
export interface ReminderLogRow {
	event_id: string;
	guest_id: string;
	email: string;
	offset_days: number;
	ok: boolean;
	provider_id: string | null;
	error: string | null;
}

/** Resultado de un intento de envío, como lo devuelve lib/email. */
export interface SendResult {
	ok: boolean;
	id?: string;
	error?: string;
}

/** Errores largos del proveedor: se recortan para no inflar la tabla. */
const MAX_ERROR_LEN = 500;

/**
 * Arma la fila de bitácora de un intento de envío.
 * `provider_id` solo tiene sentido si el envío salió bien; `error` solo si falló.
 */
export function buildLogRow(
	eventId: string,
	guest: { id: string; email: string },
	offsetDays: number,
	result: SendResult,
): ReminderLogRow {
	return {
		event_id: eventId,
		guest_id: guest.id,
		email: guest.email,
		offset_days: offsetDays,
		ok: result.ok,
		provider_id: result.ok ? (result.id ?? null) : null,
		error: result.ok
			? null
			: (result.error ?? "error desconocido").slice(0, MAX_ERROR_LEN),
	};
}
