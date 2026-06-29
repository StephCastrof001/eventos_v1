import { randomBytes } from "node:crypto";

/**
 * Token aleatorio url-safe (CSPRNG). Para magic_token y qr_token.
 * NUNCA derivar de guest_id (ADR-002). 32 bytes ≈ 43 chars base64url.
 */
export function newToken(): string {
	return randomBytes(32).toString("base64url");
}
