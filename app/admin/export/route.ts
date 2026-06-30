import { NextResponse } from "next/server";
import { getEventGuests } from "@/lib/api/admin";
import { getEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
	// Obtener params
	const url = new URL(request.url);
	const eventId = url.searchParams.get("eventId");
	if (!eventId) {
		return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
	}

	// Verificar Auth
	const auth = await createServerSupabase();
	const {
		data: { user },
	} = await auth.auth.getUser();

	if (!user?.email || !user.email_confirmed_at) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const allowed = getEnv()
		.ADMIN_EMAILS.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (!allowed.includes(user.email.toLowerCase())) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	try {
		// Obtener Data
		const guests = await getEventGuests(eventId);

		// Generar CSV
		const headers = [
			"ID",
			"Nombre",
			"Apellido",
			"Email",
			"Rol",
			"Empresa",
			"Telefono",
			"DNI",
			"RUC",
			"Estado",
			"Fecha de Registro",
		];

		const rows = guests.map((g) => [
			g.id,
			g.name || "",
			g.last_name || "",
			g.email || "",
			g.role || "",
			g.company || "",
			g.phone || "",
			g.dni || "",
			g.ruc || "",
			g.status || "",
			g.created_at || "",
		]);

		const csvContent = [headers, ...rows]
			.map((row) =>
				row
					.map((cell) => {
						// Escape comillas y envolver en comillas
						const str = String(cell).replace(/"/g, '""');
						return `"${str}"`;
					})
					.join(","),
			)
			.join("\n");

		// Retornar CSV
		return new NextResponse(csvContent, {
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="invitados-${eventId}.csv"`,
			},
		});
	} catch (err) {
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}
