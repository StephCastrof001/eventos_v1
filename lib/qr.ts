import * as QRCode from "qrcode";

export async function makeQrDataUrl(text: string): Promise<string> {
	return QRCode.toDataURL(text);
}
