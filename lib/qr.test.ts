import jsQR from "jsqr";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { makeQrDataUrl } from "./qr";

describe("makeQrDataUrl", () => {
	it("generates a valid PNG data URL that can be decoded back to the original text", async () => {
		const text = "https://hackia.com/badge/abc-123";
		const dataUrl = await makeQrDataUrl(text);

		expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);

		// Decode base64 to buffer
		const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
		const buffer = Buffer.from(base64Data, "base64");

		// Parse PNG
		const png = PNG.sync.read(buffer);

		// Decode QR
		const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

		expect(code).not.toBeNull();
		expect(code?.data).toBe(text);
	});
});
