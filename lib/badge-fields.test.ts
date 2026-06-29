import { describe, expect, it } from "vitest";
import { buildBadgeFields } from "./badge-fields";

describe("buildBadgeFields", () => {
	it("formats displayName without hanging space if last_name is missing", () => {
		const result = buildBadgeFields({ name: "Juan" });
		expect(result.displayName).toBe("Juan");
	});

	it("formats displayName correctly with name and last_name", () => {
		const result = buildBadgeFields({ name: "Juan", last_name: "Pérez" });
		expect(result.displayName).toBe("Juan Pérez");
	});

	it("formats subtitle correctly with role and company", () => {
		const result = buildBadgeFields({
			name: "A",
			role: "Dev",
			company: "Hack",
		});
		expect(result.subtitle).toBe("Dev · Hack");
	});

	it("formats subtitle without hanging dot if company is missing", () => {
		const result = buildBadgeFields({ name: "A", role: "Dev" });
		expect(result.subtitle).toBe("Dev");
	});

	it("formats subtitle without hanging dot if role is missing", () => {
		const result = buildBadgeFields({ name: "A", company: "Hack" });
		expect(result.subtitle).toBe("Hack");
	});

	it("handles empty fields correctly", () => {
		const result = buildBadgeFields({ name: "A", role: "", company: null });
		expect(result.subtitle).toBe("");
	});
});
