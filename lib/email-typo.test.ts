import { describe, expect, it } from "vitest";
import { suggestEmailCorrection } from "./email-typo";

describe("suggestEmailCorrection", () => {
	// --- Correcciones por TLD typo ---

	it("corrige .co → .com en gmail", () => {
		expect(suggestEmailCorrection("user@gmail.co")).toBe("user@gmail.com");
	});

	it("corrige .con → .com en outlook", () => {
		expect(suggestEmailCorrection("user@outlook.con")).toBe("user@outlook.com");
	});

	it("corrige .cmo → .com en gmail", () => {
		expect(suggestEmailCorrection("user@gmail.cmo")).toBe("user@gmail.com");
	});

	it("corrige .comm → .com en yahoo", () => {
		expect(suggestEmailCorrection("user@yahoo.comm")).toBe("user@yahoo.com");
	});

	// --- Correcciones por Levenshtein (distancia 1-2) ---

	it("corrige gmial.com → gmail.com (distancia 1)", () => {
		expect(suggestEmailCorrection("user@gmial.com")).toBe("user@gmail.com");
	});

	it("corrige hotmial.com → hotmail.com (distancia 1)", () => {
		expect(suggestEmailCorrection("user@hotmial.com")).toBe("user@hotmail.com");
	});

	it("corrige outlok.com → outlook.com (distancia 1)", () => {
		expect(suggestEmailCorrection("user@outlok.com")).toBe("user@outlook.com");
	});

	// --- Dominios ya correctos → null ---

	it("retorna null si el dominio ya es gmail.com (válido)", () => {
		expect(suggestEmailCorrection("user@gmail.com")).toBeNull();
	});

	it("retorna null si el dominio ya es hotmail.com (válido)", () => {
		expect(suggestEmailCorrection("user@hotmail.com")).toBeNull();
	});

	it("retorna null si el dominio ya es outlook.com (válido)", () => {
		expect(suggestEmailCorrection("user@outlook.com")).toBeNull();
	});

	it("retorna null si el dominio ya es yahoo.com (válido)", () => {
		expect(suggestEmailCorrection("user@yahoo.com")).toBeNull();
	});

	// --- Dominios desconocidos y lejanos → null (no molestar) ---

	it("retorna null para dominio desconocido miempresa.pe", () => {
		expect(suggestEmailCorrection("user@miempresa.pe")).toBeNull();
	});

	it("retorna null para dominio corporativo lejano (example.com)", () => {
		expect(suggestEmailCorrection("user@example.com")).toBeNull();
	});

	// --- Edge cases ---

	it("retorna null si el email no tiene @", () => {
		expect(suggestEmailCorrection("nodomain")).toBeNull();
	});
});
