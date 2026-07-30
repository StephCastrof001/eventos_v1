import { describe, expect, it } from "vitest";
import { formatEventDateRange } from "./format-date";

describe("formatEventDateRange", () => {
	it("muestra la hora en Lima, no en UTC (19:00 -05:00 NO es 20 ago)", () => {
		const out = formatEventDateRange(
			"2026-08-19T19:00:00-05:00",
			"2026-08-19T21:00:00-05:00",
		);
		// Debe decir 19 de agosto (no 20) y las 07:00 (7pm Lima), no 00:00 (UTC).
		expect(out).toContain("19 de agosto");
		expect(out).not.toContain("20 de agosto");
		expect(out).toContain("07:00");
		expect(out).not.toContain("12:00");
	});

	it("mismo día → agrega solo la hora de fin", () => {
		const out = formatEventDateRange(
			"2026-08-19T19:00:00-05:00",
			"2026-08-19T21:00:00-05:00",
		);
		expect(out).toContain(" - ");
		expect(out).not.toContain("hasta");
	});

	it("días distintos → usa 'hasta' con la fecha completa", () => {
		const out = formatEventDateRange(
			"2026-08-19T19:00:00-05:00",
			"2026-08-20T09:00:00-05:00",
		);
		expect(out).toContain("hasta");
		expect(out).toContain("20 de agosto");
	});

	it("sin fecha → cadena vacía", () => {
		expect(formatEventDateRange(null)).toBe("");
		expect(formatEventDateRange(undefined)).toBe("");
	});
});
