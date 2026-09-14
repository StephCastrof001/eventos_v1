import { NextResponse } from "next/server";
import { getInscritos, getTallerBySlug } from "@/lib/api/cursos";
import { getEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

/** Caracteres con los que Excel lee una celda como fórmula y no como texto. */
const INICIO_DE_FORMULA = ["=", "+", "-", "@", "\t", "\r"];

/**
 * Prepara un valor para el CSV. Hace dos cosas, y la segunda importa más de lo
 * que parece:
 *
 * 1. Lo envuelve en comillas y escapa las internas, porque un cargo con coma
 *    partiría el archivo en dos columnas.
 * 2. Neutraliza la inyección de fórmulas. Estos datos los tipea cualquiera en
 *    un formulario público: si alguien pone =HYPERLINK("http://...") como
 *    cargo, Excel lo ejecuta al abrir el archivo, en la máquina de quien
 *    descargó la lista. Anteponer una comilla simple obliga a Excel a tratarlo
 *    como texto y a mostrarlo tal cual.
 */
function celda(valor: unknown): string {
	let texto = String(valor ?? "");
	if (INICIO_DE_FORMULA.some((c) => texto.startsWith(c))) {
		texto = `'${texto}`;
	}
	return `"${texto.replace(/"/g, '""')}"`;
}

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
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

	const { slug } = await params;
	const taller = await getTallerBySlug(slug);
	if (!taller) {
		return NextResponse.json(
			{ error: "Taller no encontrado" },
			{ status: 404 },
		);
	}

	const inscritos = await getInscritos(taller.id);
	const cabeceras = [
		"Nombres",
		"Apellidos",
		"DNI",
		"Email",
		"WhatsApp",
		"Centro de labores",
		"Cargo",
		"Pagado",
		"Fecha de inscripcion",
	];

	const filas = inscritos.map((i) => [
		i.nombres,
		i.apellidos,
		i.dni,
		i.email,
		i.telefono,
		i.centro_labores,
		i.cargo,
		i.pagado ? "SI" : "NO",
		i.created_at,
	]);

	// BOM para que Excel en Windows no rompa las tildes.
	const csv = `﻿${[cabeceras, ...filas]
		.map((fila) => fila.map(celda).join(","))
		.join("\n")}`;

	return new NextResponse(csv, {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="inscritos-${slug}.csv"`,
		},
	});
}
