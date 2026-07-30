/**
 * Formateo de fechas del evento en hora de Lima. Centralizado acá porque el
 * server de Vercel corre en UTC: sin `timeZone` explícito, "19:00 -05:00" se
 * renderiza como "00:00 del día siguiente". Todo lo que muestre fechas del
 * evento (página, emails, cron) debe pasar por acá.
 */
const TZ = "America/Lima";

/** Fecha corta en Lima, ej "miércoles, 19 de agosto" (para comparar días). */
function shortDay(d: Date): string {
	return d.toLocaleDateString("es-PE", { timeZone: TZ });
}

/**
 * Rango de fechas del evento en hora de Lima.
 * Mismo día → "miércoles, 19 de agosto, 07:00 p. m. - 09:00 p. m.".
 * Días distintos → "... hasta jueves, 20 de agosto, 09:00 a. m.".
 * Sin fecha → "".
 */
export function formatEventDateRange(
	eventDate?: string | null,
	endDate?: string | null,
): string {
	if (!eventDate) return "";
	const start = new Date(eventDate);
	let out = start.toLocaleDateString("es-PE", {
		weekday: "long",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: TZ,
	});
	if (endDate) {
		const end = new Date(endDate);
		if (shortDay(start) === shortDay(end)) {
			out += ` - ${end.toLocaleTimeString("es-PE", {
				hour: "2-digit",
				minute: "2-digit",
				timeZone: TZ,
			})}`;
		} else {
			out += ` hasta ${end.toLocaleDateString("es-PE", {
				weekday: "long",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				timeZone: TZ,
			})}`;
		}
	}
	return out;
}
