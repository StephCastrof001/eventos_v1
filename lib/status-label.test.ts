import { describe, expect, it } from "vitest";
import { statusLabel } from "./status-label";

describe("statusLabel", () => {
	it("returns correct text and color for each state", () => {
		expect(statusLabel("registered")).toEqual({
			text: "Pendiente",
			color: "amber",
		});
		expect(statusLabel("approved")).toEqual({
			text: "Aprobado",
			color: "green",
		});
		expect(statusLabel("badge_ready")).toEqual({
			text: "Badge listo",
			color: "purple",
		});
		expect(statusLabel("checked_in")).toEqual({
			text: "Asistió",
			color: "teal",
		});
		expect(statusLabel("rejected")).toEqual({
			text: "Rechazado",
			color: "red",
		});
		expect(statusLabel("canceled")).toEqual({
			text: "Cancelado",
			color: "gray",
		});
	});
});
