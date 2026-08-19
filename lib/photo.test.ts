import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, validatePhoto } from "./photo";

describe("validatePhoto", () => {
	it("rejects application/pdf", () => {
		const result = validatePhoto({ type: "application/pdf", size: 1_000_000 });
		expect(result.ok).toBe(false);
		expect(result.error).toBeDefined();
	});

	it("rejects 6MB files", () => {
		const result = validatePhoto({ type: "image/jpeg", size: 6_000_000 });
		expect(result.ok).toBe(false);
		expect(result.error).toBeDefined();
	});

	it("accepts image/jpeg 1MB", () => {
		const result = validatePhoto({ type: "image/jpeg", size: 1_000_000 });
		expect(result.ok).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it("accepts image/png and image/webp within size limit", () => {
		expect(validatePhoto({ type: "image/png", size: 3_500_000 }).ok).toBe(true);
		expect(validatePhoto({ type: "image/webp", size: 1 }).ok).toBe(true);
	});

	// Vercel devuelve 413 sobre ~4.5MB antes de llegar acá: el límite propio
	// tiene que quedar por debajo o el error que ve el invitado es el de la
	// plataforma (texto plano, sin JSON) en vez del nuestro.
	it("rejects files over the Vercel payload ceiling", () => {
		expect(validatePhoto({ type: "image/jpeg", size: 4_600_000 }).ok).toBe(
			false,
		);
		expect(validatePhoto({ type: "image/jpeg", size: MAX_PHOTO_BYTES }).ok).toBe(
			true,
		);
	});
});
