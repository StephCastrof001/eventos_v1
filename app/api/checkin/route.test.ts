import { describe, expect, test, vi } from "vitest";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabase } from "@/lib/supabase/server";
import { POST } from "./route";

// route.ts usa createAdminSupabase (service_role, sync) — no createServerSupabase.
vi.mock("@/lib/supabase/server", () => ({
	createAdminSupabase: vi.fn(),
}));

// Gate staff-only. Por default autoriza; un test lo rechaza para probar el 401.
vi.mock("@/lib/admin-auth", () => ({
	requireAdmin: vi.fn(),
}));

function mockSupabase(
	guestData: Record<string, unknown> | null,
	fetchError: Error | { message: string } | null = null,
	updateError: Error | { message: string } | null = null,
	// Filas afectadas por el update (optimistic lock). [] = otra caja ganó la carrera.
	updatedRows: Array<{ id: string }> | null = [{ id: "123" }],
) {
	const mockSb = {
		from: vi.fn(() => ({
			select: vi.fn(() => ({
				eq: vi.fn(() => ({
					eq: vi.fn(() => ({
						single: vi.fn().mockResolvedValue({
							data: guestData,
							error: fetchError,
						}),
					})),
				})),
			})),
			update: vi.fn(() => ({
				eq: vi.fn(() => ({
					eq: vi.fn(() => ({
						eq: vi.fn(() => ({
							select: vi.fn().mockResolvedValue({
								data: updatedRows,
								error: updateError,
							}),
						})),
					})),
				})),
			})),
		})),
	};
	// createAdminSupabase es sync (no async) -> mockReturnValue.
	// biome-ignore lint/suspicious/noExplicitAny: mock
	(createAdminSupabase as any).mockReturnValue(mockSb);
}

describe("POST /api/checkin", () => {
	const eventId = "d390a786-8f2e-4b68-b4b3-5793e53c483a";

	test("should_return_401_when_not_admin", async () => {
		(requireAdmin as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
			new Error("No autorizado"),
		);
		const req = new Request("http://localhost/api/checkin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrToken: "abc", eventId }),
		});
		const res = await POST(req);
		expect(res.status).toBe(401);
	});

	test("should_return_400_when_eventId_missing", async () => {
		const req = new Request("http://localhost/api/checkin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrToken: "abc" }),
		});
		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	test("should_return_404_when_token_not_found", async () => {
		mockSupabase(null, new Error("Not found"));
		const req = new Request("http://localhost/api/checkin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrToken: "abc", eventId }),
		});
		const res = await POST(req);
		expect(res.status).toBe(404);
	});

	test("should_return_409_when_guest_already_checked_in", async () => {
		mockSupabase({ id: "123", name: "John", status: "checked_in" });
		const req = new Request("http://localhost/api/checkin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrToken: "abc", eventId }),
		});
		const res = await POST(req);
		expect(res.status).toBe(409);
	});

	test("should_return_200_and_set_checked_in_when_valid", async () => {
		mockSupabase({ id: "123", name: "John", status: "badge_ready" });
		const req = new Request("http://localhost/api/checkin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrToken: "abc", eventId }),
		});
		const res = await POST(req);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.guest.status).toBe("checked_in");
	});

	test("should_write_checked_in_at_timestamp_on_checkin", async () => {
		// Captura el payload del update para verificar que guarda la hora de ingreso.
		const updateSpy = vi.fn(() => ({
			eq: vi.fn(() => ({
				eq: vi.fn(() => ({
					eq: vi.fn(() => ({
						select: vi
							.fn()
							.mockResolvedValue({ data: [{ id: "123" }], error: null }),
					})),
				})),
			})),
		}));
		const mockSb = {
			from: vi.fn(() => ({
				select: vi.fn(() => ({
					eq: vi.fn(() => ({
						eq: vi.fn(() => ({
							single: vi.fn().mockResolvedValue({
								data: { id: "123", name: "John", status: "approved" },
								error: null,
							}),
						})),
					})),
				})),
				update: updateSpy,
			})),
		};
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(createAdminSupabase as any).mockReturnValue(mockSb);

		const req = new Request("http://localhost/api/checkin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrToken: "abc", eventId }),
		});
		await POST(req);

		expect(updateSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				status: "checked_in",
				checked_in_at: expect.any(String),
			}),
		);
	});

	test("should_return_409_when_race_lost_zero_rows_updated", async () => {
		// Invitado válido al leer, pero el update afecta 0 filas: otra caja de staff
		// ya lo escaneó entre el fetch y el update (optimistic lock lo detecta).
		mockSupabase(
			{ id: "123", name: "John", status: "approved" },
			null,
			null,
			[],
		);
		const req = new Request("http://localhost/api/checkin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrToken: "abc", eventId }),
		});
		const res = await POST(req);
		expect(res.status).toBe(409);
		const json = await res.json();
		expect(json.reason).toBe("already_checked_in");
	});

	test("should_filter_by_event_id", async () => {
		const mockEqEventId = vi.fn().mockReturnValue({
			single: vi
				.fn()
				.mockResolvedValue({ data: null, error: new Error("Not found") }),
		});
		const mockEqQrToken = vi.fn().mockReturnValue({
			eq: mockEqEventId,
		});

		const mockSb = {
			from: vi.fn(() => ({
				select: vi.fn(() => ({
					eq: mockEqQrToken,
				})),
			})),
		};
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(createAdminSupabase as any).mockReturnValue(mockSb);

		const req = new Request("http://localhost/api/checkin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrToken: "abc", eventId }),
		});
		const res = await POST(req);
		expect(res.status).toBe(404);

		expect(mockEqEventId).toHaveBeenCalledWith("event_id", eventId);
	});
});
