/**
 * Lógica pura de recordatorios (Bloque B). Sin I/O: fácil de testear.
 * El cron diario (app/api/cron/reminders) usa estos helpers para decidir
 * a quién le toca recordatorio hoy y con qué offset.
 */

/** Offsets por defecto: 10, 5 y 1 día antes del evento. */
export const DEFAULT_OFFSETS: readonly number[] = [10, 5, 1];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Parsea la env REMINDER_OFFSETS ("10,5,1") a números.
 * Ignora vacíos/negativos/no-numéricos. Si no hay válidos → DEFAULT_OFFSETS.
 */
export function parseReminderOffsets(raw?: string | null): number[] {
	if (!raw) return [...DEFAULT_OFFSETS];
	const parsed = raw
		.split(",")
		.map((s) => Number.parseInt(s.trim(), 10))
		.filter((n) => Number.isInteger(n) && n > 0);
	return parsed.length > 0 ? parsed : [...DEFAULT_OFFSETS];
}

/**
 * Días al evento, redondeados al día más cercano. Redondear (no `ceil`) evita
 * que las horas del día descuadren el offset: el cron corre en la mañana y el
 * evento suele ser en la tarde, así que la diferencia es siempre "X días + unas
 * horas" → redondea a X. Ej: evento mañana 19:00, hoy 09:00 (34h) → 1.
 * Evento ya pasó → <= 0.
 */
export function daysUntilEvent(eventDate: Date, now: Date): number {
	return Math.round((eventDate.getTime() - now.getTime()) / MS_PER_DAY);
}

/**
 * Offset vigente hoy: el más chico de los configurados que todavía sea >=
 * `daysUntil`. Devuelve null si el evento está demasiado lejos (ningún offset
 * alcanza) o si ya pasó.
 *
 * La igualdad exacta (`offsets.includes(daysUntil)`) era frágil: si el cron no
 * corría justo el día del offset -- Vercel caído, deploy en curso, el schedule
 * corrido unos minutos sobre el cambio de día -- ese recordatorio no se enviaba
 * nunca más, porque al día siguiente `daysUntil` ya no coincidía con ninguno.
 *
 * Con ">= daysUntil" la ventana queda abierta hasta el offset siguiente: a 10
 * días vence el de 10 y sigue vigente los días 9, 8, 7 y 6; a 5 días toma el
 * relevo el de 5. Combinado con `alreadySent`, el que sí se envió no se repite,
 * y el que se perdió sale apenas el cron vuelve a correr.
 *
 * Efecto secundario deseado: un invitado aprobado tarde recibe el recordatorio
 * de la etapa en curso en vez de quedarse sin ninguno.
 */
export function dueOffset(daysUntil: number, offsets: number[]): number | null {
	if (daysUntil < 0) return null;
	const vigentes = offsets.filter((o) => o >= daysUntil);
	return vigentes.length > 0 ? Math.min(...vigentes) : null;
}

/** ¿Ya se envió ese offset a este invitado? (idempotencia) */
export function alreadySent(reminderSent: number[], offset: number): boolean {
	return reminderSent.includes(offset);
}

/**
 * Compara emails ignorando mayúsculas y espacios de los costados.
 * Usado por el parámetro `only` del cron para acotar el envío a un invitado
 * concreto de la base, sin cambiar el camino de código del envío masivo.
 */
export function sameEmail(a: string, b: string): boolean {
	return a.trim().toLowerCase() === b.trim().toLowerCase();
}
