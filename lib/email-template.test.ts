import { describe, expect, it } from "vitest";
import { buildApprovalEmail, buildReminderEmail } from "./email-template";

describe("buildApprovalEmail", () => {
	it("includes name and exact magicUrl in the html", () => {
		const result = buildApprovalEmail({
			name: "Juan",
			magicUrl: "https://hackia.com/magic?token=123",
		});
		expect(result.html).toContain("Juan");
		expect(result.html).toContain('href="https://hackia.com/magic?token=123"');
	});

	it("mentions HACK IA in the non-empty subject", () => {
		const result = buildApprovalEmail({
			name: "Ana",
			magicUrl: "https://x.com",
		});
		expect(result.subject).toContain("HACK IA");
		expect(result.subject.length).toBeGreaterThan(0);
	});

	it("rejects non-http(s) magicUrl schemes (XSS hardening)", () => {
		expect(() =>
			buildApprovalEmail({ name: "Ana", magicUrl: "javascript:alert(1)" }),
		).toThrow();
	});

	it("escapes malicious characters in the name", () => {
		const result = buildApprovalEmail({
			name: '<script>alert("XSS")</script>&',
			magicUrl: "https://x.com",
		});
		expect(result.html).not.toContain("<script>");
		expect(result.html).not.toContain('alert("XSS")');
		expect(result.html).toContain(
			"&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;",
		);
	});
});

const BASE_REMINDER = {
	name: "Pedro",
	eventName: "HACK IA Summit",
	dateStr: "miércoles 19 de agosto, 19:00 - 21:00",
	agendaUrl: "https://hackia.com/agenda",
} as const;

describe("buildReminderEmail", () => {
	it("subject empieza con 'Mañana:' cuando daysBefore=1", () => {
		const { subject } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 1 });
		expect(subject).toMatch(/^Mañana:/);
	});

	it("subject contiene 'Faltan 5 días' cuando daysBefore=5", () => {
		const { subject } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 5 });
		expect(subject).toContain("Faltan 5 días");
	});

	it("subject contiene 'Faltan 10 días' cuando daysBefore=10", () => {
		const { subject } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 10,
		});
		expect(subject).toContain("Faltan 10 días");
	});

	it("html contiene el agendaUrl y el texto 'Ver agenda'", () => {
		const { html } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 5 });
		expect(html).toContain("https://hackia.com/agenda");
		expect(html).toContain("Ver agenda");
	});

	it("html contiene el nombre del invitado", () => {
		const { html } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 5 });
		expect(html).toContain("Pedro");
	});

	it("html contiene la fecha formateada", () => {
		const { html } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 5 });
		expect(html).toContain("miércoles 19 de agosto, 19:00 - 21:00");
	});

	it("con badgeUrl presente → html contiene 'Haz tu credencial' y el badgeUrl", () => {
		const { html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 5,
			badgeUrl: "https://hackia.com/badge/abc",
		});
		expect(html).toContain("Haz tu credencial");
		expect(html).toContain("https://hackia.com/badge/abc");
	});

	it("con badgeUrl null → html NO contiene 'Haz tu credencial'", () => {
		const { html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 5,
			badgeUrl: null,
		});
		expect(html).not.toContain("Haz tu credencial");
	});

	it("con badgeUrl undefined → html NO contiene 'Haz tu credencial'", () => {
		const { html } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 5 });
		expect(html).not.toContain("Haz tu credencial");
	});

	it("agendaUrl con esquema no http → lanza Error", () => {
		expect(() =>
			buildReminderEmail({
				...BASE_REMINDER,
				daysBefore: 5,
				agendaUrl: "javascript:alert(1)",
			}),
		).toThrow();
	});

	it("badgeUrl con esquema no http → lanza Error", () => {
		expect(() =>
			buildReminderEmail({
				...BASE_REMINDER,
				daysBefore: 5,
				badgeUrl: "javascript:xss()",
			}),
		).toThrow();
	});
});
