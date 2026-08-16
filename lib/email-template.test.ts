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
	it("la víspera usa su propio subject y título", () => {
		const { subject, html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 1,
		});
		expect(subject).toBe("Mañana nos vemos — HACK IA Summit");
		expect(html).toContain("¡Mañana nos vemos!");
		expect(html).toContain("Es mañana.");
	});

	it("los días previos comparten subject y título de antesala", () => {
		for (const daysBefore of [2, 5, 10]) {
			const { subject, html } = buildReminderEmail({
				...BASE_REMINDER,
				daysBefore,
			});
			expect(subject).toBe("Nos vemos en el HACK IA Summit");
			expect(html).toContain("Nos vemos muy pronto");
			expect(html).toContain("a solo unos días");
		}
	});

	it("html contiene el agendaUrl y el CTA de ponentes", () => {
		const { html } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 5 });
		expect(html).toContain("https://hackia.com/agenda");
		expect(html).toContain("Ver ponentes y agenda");
	});

	it("cierra con la firma de la comunidad", () => {
		const { html } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 5 });
		expect(html).toContain("¡Nos vemos muy pronto!");
		expect(html).toContain("Con cariño");
	});

	it("normaliza nombres gritados pero respeta los de mayúscula mezclada", () => {
		const gritado = buildReminderEmail({
			...BASE_REMINDER,
			name: "STEPHANIE",
			daysBefore: 2,
		});
		expect(gritado.html).toContain("Stephanie");
		expect(gritado.html).not.toContain("STEPHANIE");

		const mezclado = buildReminderEmail({
			...BASE_REMINDER,
			name: "Ana de la Cruz",
			daysBefore: 2,
		});
		expect(mezclado.html).toContain("Ana de la Cruz");
	});

	it("renderiza instructions como una línea por renglón", () => {
		const { html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 2,
			instructions: "Check-in 6:30 p.m.\nSin estacionamiento",
		});
		expect(html).toContain("Check-in 6:30 p.m.");
		expect(html).toContain("Sin estacionamiento");
	});

	it("omite el bloque de instructions cuando no hay data", () => {
		const { html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 2,
			instructions: "   ",
		});
		expect(html).not.toContain("border-top:1px solid #2a2a3a");
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

	it("incluye la direccion del evento cuando viene location", () => {
		const { html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 5,
			location: "Av. Juan de Arona 720, San Isidro, Lima",
		});
		expect(html).toContain("Av. Juan de Arona 720, San Isidro, Lima");
	});

	it("con locationUrl la direccion es un link a Maps", () => {
		const { html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 5,
			location: "Av. Juan de Arona 720",
			locationUrl: "https://maps.google.com/?q=arona",
		});
		expect(html).toContain('href="https://maps.google.com/?q=arona"');
	});

	it("sin location no aparece el pin", () => {
		const { html } = buildReminderEmail({ ...BASE_REMINDER, daysBefore: 5 });
		expect(html).not.toContain("📍");
	});

	it("locationUrl con esquema peligroso degrada a texto, no rompe el envio", () => {
		const { html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 5,
			location: "Av. Juan de Arona 720",
			locationUrl: "javascript:alert(1)",
		});
		expect(html).toContain("Av. Juan de Arona 720");
		expect(html).not.toContain("javascript:");
	});

	it("escapa html en la direccion", () => {
		const { html } = buildReminderEmail({
			...BASE_REMINDER,
			daysBefore: 5,
			location: '<script>alert("x")</script>',
		});
		expect(html).not.toContain("<script>");
	});
});
