export function validatePhoto(input: { type: string; size: number }): {
	ok: boolean;
	error?: string;
} {
	const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
	const maxSize = 5_000_000;

	if (!validMimeTypes.includes(input.type)) {
		return { ok: false, error: "invalid_type" };
	}

	if (input.size > maxSize) {
		return { ok: false, error: "too_large" };
	}

	return { ok: true };
}
