import { describe, expect, it } from "vitest";
import { parseLumaCsv } from "./luma";

// Fixture con datos FALSOS (mismo formato/columnas que el export real de Luma).
// Incluye BOM, un nombre entre comillas, y mezcla approved/pending.
const HEADER =
	"﻿guest_id,name,first_name,last_name,email,phone_number,created_at,approval_status,checked_in_at,utm_source,qr_code_url,amount,amount_tax,amount_discount,currency,coupon_code,eth_address,solana_address,survey_response_rating,survey_response_feedback,ticket_type_id,ticket_name,¿Para qué empresa trabajas?,¿Cuál es tu cargo?,Nro. de DNI,Ruc de la empresa";

const ROWS = [
	"gst-AAA,Fake One,Fake,One,fake1@example.com,+51900000001,2026-01-01T00:00:00Z,approved,,,https://luma.com/check-in/evt-X?pk=AAA,,,,,,,,,,ttype-x,Standard,AcmeCorp,Developer,11111111,20111111111",
	'gst-BBB,"Two Person ",,,fake2@example.com,+51900000002,2026-01-01T00:00:00Z,approved,,,https://luma.com/check-in/evt-X?pk=BBB,,,,,,,,,,ttype-x,Standard,BetaInc,Manager,22222222,20222222222',
	"gst-CCC,Three P,Three,P,fake3@example.com,+51900000003,2026-01-01T00:00:00Z,pending_approval,,,https://luma.com/check-in/evt-X?pk=CCC,,,,,,,,,,ttype-x,Standard,Gamma,PM,33333333,20333333333",
];
const CSV = [HEADER, ...ROWS].join("\n");

describe("parseLumaCsv", () => {
	it("returns only approved guests (filters pending)", () => {
		const guests = parseLumaCsv(CSV);
		expect(guests).toHaveLength(2);
		expect(guests.map((g) => g.external_id)).toEqual(["gst-AAA", "gst-BBB"]);
	});

	it("maps custom columns (role, company, dni, ruc, qr_url)", () => {
		const [a] = parseLumaCsv(CSV);
		expect(a.name).toBe("Fake");
		expect(a.last_name).toBe("One");
		expect(a.email).toBe("fake1@example.com");
		expect(a.role).toBe("Developer");
		expect(a.company).toBe("AcmeCorp");
		expect(a.dni).toBe("11111111");
		expect(a.ruc).toBe("20111111111");
		expect(a.qr_url).toBe("https://luma.com/check-in/evt-X?pk=AAA");
	});

	it("handles quoted names and falls back to full name when first_name empty", () => {
		const b = parseLumaCsv(CSV)[1];
		expect(b.name).toBe("Two Person");
		expect(b.company).toBe("BetaInc");
	});

	it("returns [] for empty or header-only input", () => {
		expect(parseLumaCsv("")).toEqual([]);
	});
});
