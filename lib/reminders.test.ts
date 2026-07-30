import { describe, expect, it } from "vitest";
import {
	alreadySent,
	DEFAULT_OFFSETS,
	daysUntilEvent,
	dueOffset,
	parseReminderOffsets,
} from "./reminders";

describe("parseReminderOffsets", () => {
	it("usa el default cuando no hay valor", () => {
		expect(parseReminderOffsets(undefined)).toEqual([...DEFAULT_OFFSETS]);
		expect(parseReminderOffsets("")).toEqual([...DEFAULT_OFFSETS]);
	});

	it("parsea una lista separada por comas", () => {
		expect(parseReminderOffsets("14, 7, 2")).toEqual([14, 7, 2]);
	});

	it("descarta valores inválidos y negativos", () => {
		expect(parseReminderOffsets("10, abc, -3, 0, 1")).toEqual([10, 1]);
	});

	it("cae al default si no queda ninguno válido", () => {
		expect(parseReminderOffsets("abc, -1")).toEqual([...DEFAULT_OFFSETS]);
	});
});

describe("daysUntilEvent", () => {
	it("evento mañana → 1", () => {
		const now = new Date("2026-08-18T09:00:00-05:00");
		const event = new Date("2026-08-19T19:00:00-05:00");
		expect(daysUntilEvent(event, now)).toBe(1);
	});

	it("evento en 10 días (mismo momento) → 10", () => {
		const now = new Date("2026-08-09T19:00:00-05:00");
		const event = new Date("2026-08-19T19:00:00-05:00");
		expect(daysUntilEvent(event, now)).toBe(10);
	});

	it("evento ya pasó → <= 0", () => {
		const now = new Date("2026-08-20T09:00:00-05:00");
		const event = new Date("2026-08-19T19:00:00-05:00");
		expect(daysUntilEvent(event, now)).toBeLessThanOrEqual(0);
	});
});

describe("dueOffset", () => {
	it("devuelve el offset cuando hoy coincide", () => {
		expect(dueOffset(5, [10, 5, 1])).toBe(5);
	});

	it("null cuando hoy no toca ningún recordatorio", () => {
		expect(dueOffset(7, [10, 5, 1])).toBeNull();
	});
});

describe("alreadySent", () => {
	it("true si el offset ya fue enviado", () => {
		expect(alreadySent([10, 5], 5)).toBe(true);
	});

	it("false si aún no se envió ese offset", () => {
		expect(alreadySent([10], 5)).toBe(false);
	});
});
