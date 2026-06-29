import jsQR from "jsqr";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { makeCheckinQr } from "./checkin-qr";

describe("makeCheckinQr", () => {
	it("generates a valid QR containing the correct checkin URL", async () => {
		const appUrl = "https://hackia.com";
		const qrToken = "secret-token-123";
		const dataUrl = await makeCheckinQr(appUrl, qrToken);

		expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);

		const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
		const buffer = Buffer.from(base64Data, "base64");
		const png = PNG.sync.read(buffer);
		const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

		expect(code).not.toBeNull();
		expect(code?.data).toBe("https://hackia.com/r/secret-token-123");
	});
});
