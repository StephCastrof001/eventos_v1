export function statusLabel(s: string): { text: string; color: string } {
	switch (s) {
		case "registered":
			return { text: "Pendiente", color: "amber" };
		case "approved":
			return { text: "Aprobado", color: "green" };
		case "badge_ready":
			return { text: "Badge listo", color: "purple" };
		case "checked_in":
			return { text: "Asistió", color: "teal" };
		case "rejected":
			return { text: "Rechazado", color: "red" };
		case "canceled":
			return { text: "Cancelado", color: "gray" };
		default:
			return { text: "Desconocido", color: "gray" };
	}
}
