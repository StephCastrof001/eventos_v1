import { describe, expect, it } from "vitest";
import { buildCheckinUrl, buildMagicUrl } from "./urls";

describe("url builders", () => {
	describe("buildMagicUrl", () => {
		it("joins correctly without trailing slash", () => {
			expect(buildMagicUrl("https://hackia.com", "abc-123")).toBe(
				"https://hackia.com/badge/abc-123",
			);
		});

		it("joins correctly with trailing slash to prevent double slashes", () => {
			expect(buildMagicUrl("https://hackia.com/", "abc-123")).toBe(
				"https://hackia.com/badge/abc-123",
			);
		});

		it("encodes special characters in token", () => {
			expect(buildMagicUrl("https://hackia.com", "abc/def?xyz")).toBe(
				"https://hackia.com/badge/abc%2Fdef%3Fxyz",
			);
		});
	});

	describe("buildCheckinUrl", () => {
		it("joins correctly without trailing slash", () => {
			expect(buildCheckinUrl("https://hackia.com", "xyz-987")).toBe(
				"https://hackia.com/r/xyz-987",
			);
		});

		it("joins correctly with trailing slash to prevent double slashes", () => {
			expect(buildCheckinUrl("https://hackia.com/", "xyz-987")).toBe(
				"https://hackia.com/r/xyz-987",
			);
		});

		it("encodes special characters in token", () => {
			expect(buildCheckinUrl("https://hackia.com", "xyz=987&a=1")).toBe(
				"https://hackia.com/r/xyz%3D987%26a%3D1",
			);
		});
	});
});
