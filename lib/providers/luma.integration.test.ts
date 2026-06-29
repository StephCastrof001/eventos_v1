import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { createServerSupabase } from "@/lib/supabase/server";
import { InhouseProvider } from "./inhouse";
import { seedLumaGuests } from "./luma";

// Integración REAL contra fqek. Seedea los guests approved del CSV de Luma.
// Idempotente (dedupe por event_id,email). Excluido del run por defecto.

const CSV_PATH = path.resolve(
	__dirname,
	"../../Luma_test/Test1 - Invitados - 2026-06-28-13-49-22.csv",
);

let eventId: string;

beforeAll(async () => {
	const sb = createServerSupabase();
	const { data, error } = await sb
		.from("events")
		.upsert(
			{
				slug: "test1",
				name: "Test1",
				organizer: "HACK IA",
				location: "San Isidro",
			},
			{ onConflict: "slug" },
		)
		.select("id")
		.single();
	if (error) throw error;
	eventId = data.id;
});

describe("seedLumaGuests (integración fqek)", () => {
	it("seedea los approved del CSV real y dedupe en re-seed", async () => {
		const csv = readFileSync(CSV_PATH, "utf8");

		await seedLumaGuests(eventId, csv); // 1er seed (o ya estaban)
		const reseed = await seedLumaGuests(eventId, csv); // dedupe
		expect(reseed).toBe(0);

		const guests = await InhouseProvider.getGuests(eventId);
		expect(guests.length).toBeGreaterThanOrEqual(2);
		for (const g of guests) {
			expect(g.status).toBe("approved");
			expect(g.qr_token).toMatch(/.{20,}/); // rama B propio
			expect(g.qr_url).toContain("luma.com"); // rama A conservado
		}
	});
});
