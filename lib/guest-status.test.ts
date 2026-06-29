import { describe, expect, it } from "vitest";
import { canTransition, transition } from "./guest-status";

describe("canTransition (state machine v0.3)", () => {
	it("allows admin approval: registered -> approved", () => {
		expect(canTransition("registered", "approved")).toBe(true);
	});

	it("allows photo gate: approved -> badge_ready, and scan: badge_ready -> checked_in", () => {
		expect(canTransition("approved", "badge_ready")).toBe(true);
		expect(canTransition("badge_ready", "checked_in")).toBe(true);
	});

	it("forbids skipping states (registered -> checked_in)", () => {
		expect(canTransition("registered", "checked_in")).toBe(false);
		expect(canTransition("registered", "badge_ready")).toBe(false);
	});

	it("treats checked_in / rejected / canceled as terminal", () => {
		expect(canTransition("checked_in", "approved")).toBe(false);
		expect(canTransition("rejected", "approved")).toBe(false);
		expect(canTransition("canceled", "approved")).toBe(false);
	});
});

describe("transition", () => {
	it("returns the new status on a valid move", () => {
		expect(transition("registered", "approved")).toBe("approved");
	});

	it("throws on an invalid move", () => {
		expect(() => transition("registered", "checked_in")).toThrow();
	});
});
