function cleanAppUrl(appUrl: string): string {
	return appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
}

export function buildMagicUrl(appUrl: string, magicToken: string): string {
	const base = cleanAppUrl(appUrl);
	const token = encodeURIComponent(magicToken);
	return `${base}/badge/${token}`;
}

export function buildCheckinUrl(appUrl: string, qrToken: string): string {
	const base = cleanAppUrl(appUrl);
	const token = encodeURIComponent(qrToken);
	return `${base}/r/${token}`;
}
