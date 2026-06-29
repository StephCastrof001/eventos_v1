export function toCsv(
	rows: { name: string; email: string; status: string }[],
): string {
	const header = "name,email,status";

	function escapeField(field: string): string {
		if (field.includes(",") || field.includes('"') || field.includes("\n")) {
			return `"${field.replace(/"/g, '""')}"`;
		}
		return field;
	}

	const body = rows.map((row) => {
		return [
			escapeField(row.name),
			escapeField(row.email),
			escapeField(row.status),
		].join(",");
	});

	return [header, ...body].join("\n");
}
