import { describe, expect, it } from "vitest";
import { newToken } from "./tokens";

describe("newToken", () => {
	it("generates a long url-safe token", () => {
		const t = newToken();
		expect(t).toMatch(/^[A-Za-z0-9_-]{20,}$/);
	});

	it("generates unique tokens", () => {
		const set = new Set(Array.from({ length: 1000 }, () => newToken()));
		expect(set.size).toBe(1000);
	});
});
