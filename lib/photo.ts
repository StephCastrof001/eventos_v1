/**
 * Techo de subida: 4 MB. No es un número de diseño, es el de la plataforma —
 * Vercel corta el body de una función serverless en ~4.5 MB y devuelve
 * `FUNCTION_PAYLOAD_TOO_LARGE` ANTES de que este código corra (verificado en
 * prod el 2026-08-19: 3 MB pasa, 4.6 MB da 413). Validar por encima de ese
 * techo es mentir: el archivo nunca llega. El cliente redimensiona antes de
 * postear, así que en la práctica sube ~200 KB.
 */
export const MAX_PHOTO_BYTES = 4_000_000;

export function validatePhoto(input: { type: string; size: number }): {
	ok: boolean;
	error?: string;
} {
	const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
	const maxSize = MAX_PHOTO_BYTES;

	if (!validMimeTypes.includes(input.type)) {
		return { ok: false, error: "invalid_type" };
	}

	if (input.size > maxSize) {
		return { ok: false, error: "too_large" };
	}

	return { ok: true };
}
