import { NextResponse } from "next/server";
import { z } from "zod";
import { InhouseProvider } from "@/lib/providers/inhouse";
import { registerSchema } from "@/lib/validation";

// API interna (P7): la UI (cliente) postea acá, nunca toca Supabase directo.
const bodySchema = registerSchema.extend({ eventId: z.string().uuid() });

export async function POST(req: Request) {
	const json = await req.json().catch(() => null);
	const parsed = bodySchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, error: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { eventId, ...input } = parsed.data;
	try {
		const guest = await InhouseProvider.register(eventId, input);
		// NO devolver tokens al cliente — solo el estado.
		return NextResponse.json(
			{ ok: true, status: guest.status },
			{ status: 201 },
		);
	} catch {
		return NextResponse.json(
			{ ok: false, error: "register_failed" },
			{ status: 500 },
		);
	}
}
