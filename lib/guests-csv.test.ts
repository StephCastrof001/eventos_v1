import { describe, expect, it } from "vitest";
import { toCsv } from "./guests-csv";

describe("toCsv", () => {
	it("includes the correct header and multiple rows", () => {
		const rows = [
			{ name: "Juan", email: "juan@example.com", status: "approved" },
			{ name: "Ana", email: "ana@example.com", status: "registered" },
		];
		const result = toCsv(rows);
		const lines = result.split("\n");

		expect(lines).toHaveLength(3);
		expect(lines[0]).toBe("name,email,status");
		expect(lines[1]).toBe("Juan,juan@example.com,approved");
		expect(lines[2]).toBe("Ana,ana@example.com,registered");
	});

	it("escapes fields with commas", () => {
		const rows = [
			{ name: "Pérez, Juan", email: "juan@example.com", status: "approved" },
		];
		const result = toCsv(rows);
		const lines = result.split("\n");

		expect(lines[1]).toBe('"Pérez, Juan",juan@example.com,approved');
	});

	it("escapes fields with quotes", () => {
		const rows = [
			{
				name: 'Juan "El Jefe" Pérez',
				email: "juan@example.com",
				status: "approved",
			},
		];
		const result = toCsv(rows);
		const lines = result.split("\n");

		expect(lines[1]).toBe('"Juan ""El Jefe"" Pérez",juan@example.com,approved');
	});
});
