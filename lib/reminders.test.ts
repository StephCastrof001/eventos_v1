import { describe, expect, it } from "vitest";
import {
	alreadySent,
	DEFAULT_OFFSETS,
	daysUntilEvent,
	dueOffset,
	parseReminderOffsets,
	sameEmail,
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
	const OFFSETS = [10, 5, 1];

	it("devuelve el offset cuando hoy coincide exacto", () => {
		expect(dueOffset(10, OFFSETS)).toBe(10);
		expect(dueOffset(5, OFFSETS)).toBe(5);
		expect(dueOffset(1, OFFSETS)).toBe(1);
	});

	it("null si el evento todavía está más lejos que el offset mayor", () => {
		expect(dueOffset(20, OFFSETS)).toBeNull();
		expect(dueOffset(11, OFFSETS)).toBeNull();
	});

	// El caso que motivó el cambio: si el cron no corre el día exacto, el
	// recordatorio no debe perderse para siempre.
	it("recupera el offset de 10 en los días siguientes si no se envió", () => {
		expect(dueOffset(9, OFFSETS)).toBe(10);
		expect(dueOffset(8, OFFSETS)).toBe(10);
		expect(dueOffset(6, OFFSETS)).toBe(10);
	});

	it("al cruzar el siguiente offset, toma el relevo el más urgente", () => {
		expect(dueOffset(4, OFFSETS)).toBe(5);
		expect(dueOffset(2, OFFSETS)).toBe(5);
	});

	it("el día del evento sigue vigente el offset de 1", () => {
		expect(dueOffset(0, OFFSETS)).toBe(1);
	});

	it("null si el evento ya pasó", () => {
		expect(dueOffset(-1, OFFSETS)).toBeNull();
	});

	it("respeta offsets custom desordenados", () => {
		expect(dueOffset(6, [3, 14, 7])).toBe(7);
		expect(dueOffset(15, [3, 14, 7])).toBeNull();
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

describe("sameEmail", () => {
	it("ignora mayúsculas y espacios", () => {
		expect(sameEmail("  Persona@Ejemplo.COM ", "persona@ejemplo.com")).toBe(
			true,
		);
	});

	it("distingue dominios parecidos (.co vs .com)", () => {
		expect(sameEmail("persona@ejemplo.co", "persona@ejemplo.com")).toBe(false);
	});
});
