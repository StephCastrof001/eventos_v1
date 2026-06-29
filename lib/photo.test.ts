import { describe, expect, it } from "vitest";
import { validatePhoto } from "./photo";

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
		expect(validatePhoto({ type: "image/png", size: 5_000_000 }).ok).toBe(true);
		expect(validatePhoto({ type: "image/webp", size: 1 }).ok).toBe(true);
	});
});
