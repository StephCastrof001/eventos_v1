import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const valid = {
	NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
	NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
	SUPABASE_SERVICE_ROLE_KEY: "secret-key",
	RESEND_API_KEY: "re_x",
	EMAIL_FROM: "HACK IA <no-reply@send.klipso.xxx>",
	NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("parseEnv", () => {
	it("throws when a required var is missing", () => {
		expect(() => parseEnv({})).toThrow();
	});

	it("returns typed values when env is valid", () => {
		const parsed = parseEnv(valid);
		expect(parsed.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
		expect(parsed.RESEND_API_KEY).toBe("re_x");
	});

	it("rejects a non-URL supabase url", () => {
		expect(() =>
			parseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "not-a-url" }),
		).toThrow();
	});
});
