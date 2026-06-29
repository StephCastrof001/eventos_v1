import { makeQrDataUrl } from "./qr";
import { buildCheckinUrl } from "./urls";

export async function makeCheckinQr(
	appUrl: string,
	qrToken: string,
): Promise<string> {
	const url = buildCheckinUrl(appUrl, qrToken);
	return makeQrDataUrl(url);
}
