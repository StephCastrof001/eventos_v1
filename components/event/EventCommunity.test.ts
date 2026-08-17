import { describe, expect, it } from "vitest";
import { canalesDe } from "./EventCommunity";

/**
 * `canalesDe` es el único punto donde una URL de `events.brand` se convierte en
 * href y en payload de QR. El allowlist de esquema vive ahí, así que este test
 * es el guard: si alguien vuelve a pasar la URL cruda, se cae acá.
 */
describe("canalesDe", () => {
	it("arma los tres canales cuando las URLs son http/https", () => {
		const canales = canalesDe({
			whatsapp_group: "https://chat.whatsapp.com/ABC123",
			instagram: "https://www.instagram.com/hackia_community",
			linkedin: "https://www.linkedin.com/company/hackia",
		});
		expect(canales.map((c) => c.label)).toEqual([
			"Grupo de WhatsApp",
			"Instagram",
			"LinkedIn",
		]);
	});

	it("descarta esquemas peligrosos en vez de renderizarlos", () => {
		for (const url of [
			"javascript:alert(1)",
			"data:text/html,<script>alert(1)</script>",
			"vbscript:msgbox(1)",
			"file:///etc/passwd",
		]) {
			const canales = canalesDe({ whatsapp_group: url });
			expect(canales).toHaveLength(0);
		}
	});

	it("descarta solo el canal inválido y conserva los demás", () => {
		const canales = canalesDe({
			whatsapp_group: "javascript:alert(1)",
			instagram: "https://www.instagram.com/hackia_community",
		});
		expect(canales).toHaveLength(1);
		expect(canales[0].label).toBe("Instagram");
	});

	it("tolera URLs mal formadas y brand vacío", () => {
		expect(canalesDe({ instagram: "no es una url" })).toHaveLength(0);
		expect(canalesDe({})).toHaveLength(0);
		expect(canalesDe(null)).toHaveLength(0);
		expect(canalesDe(undefined)).toHaveLength(0);
	});

	it("deriva el handle del último segmento de la URL", () => {
		const [ig] = canalesDe({
			instagram: "https://www.instagram.com/hackia_community",
		});
		expect(ig.handle).toBe("@hackia_community");

		const [li] = canalesDe({
			linkedin: "https://www.linkedin.com/company/hackia",
		});
		expect(li.handle).toBe("hackia");
	});
});
