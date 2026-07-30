import { describe, expect, it } from "vitest";
import { buildLogRow } from "./reminder-log";

const GUEST = { id: "guest-1", email: "persona@ejemplo.com" };
const EVENT = "event-1";

describe("buildLogRow", () => {
	it("envío exitoso guarda el id de Resend y no guarda error", () => {
		const row = buildLogRow(EVENT, GUEST, 10, { ok: true, id: "re_abc123" });
		expect(row).toMatchObject({
			event_id: EVENT,
			guest_id: "guest-1",
			email: "persona@ejemplo.com",
			offset_days: 10,
			ok: true,
			provider_id: "re_abc123",
			error: null,
		});
	});

	it("envío fallido guarda el error y no guarda id", () => {
		const row = buildLogRow(EVENT, GUEST, 5, {
			ok: false,
			error: "domain not verified",
		});
		expect(row.ok).toBe(false);
		expect(row.provider_id).toBeNull();
		expect(row.error).toBe("domain not verified");
	});

	it("fallo sin mensaje deja constancia igual", () => {
		const row = buildLogRow(EVENT, GUEST, 1, { ok: false });
		expect(row.error).toBe("error desconocido");
	});

	it("recorta errores muy largos para no inflar la tabla", () => {
		const row = buildLogRow(EVENT, GUEST, 1, {
			ok: false,
			error: "x".repeat(2000),
		});
		expect(row.error).toHaveLength(500);
	});

	it("guarda el email al que se mandó, no el que tenga el guest después", () => {
		const row = buildLogRow(
			EVENT,
			{ id: "g", email: "viejo@ejemplo.com" },
			10,
			{ ok: true, id: "re_1" },
		);
		expect(row.email).toBe("viejo@ejemplo.com");
	});
});
