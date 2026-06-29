import { describe, expect, it } from "vitest";
import { buildSocialCaption } from "./social";

describe("buildSocialCaption", () => {
	it("includes phrase without name", () => {
		expect(buildSocialCaption()).toBe(
			"Asistiré al lanzamiento de la comunidad HACK IA",
		);
	});

	it("prefixes with name when provided", () => {
		expect(buildSocialCaption("Ana")).toBe(
			"Ana — Asistiré al lanzamiento de la comunidad HACK IA",
		);
	});
});
