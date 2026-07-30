/**
 * Detector de typos en dominios de email para el formulario de registro.
 * Sugiere correcciones cuando el dominio ingresado está "cerca" de uno conocido.
 * Sin librerías externas: Levenshtein implementado a mano.
 */

/** Dominios de email más comunes en la plataforma. */
const DOMINIOS_CONOCIDOS = [
	"gmail.com",
	"hotmail.com",
	"outlook.com",
	"yahoo.com",
	"icloud.com",
	"live.com",
] as const;

/** TLDs que se confunden frecuentemente con ".com". */
const TLD_TYPOS: Record<string, string> = {
	".co": ".com",
	".cmo": ".com",
	".con": ".com",
	".comm": ".com",
};

/**
 * Calcula la distancia de Levenshtein entre dos cadenas.
 * Implementación iterativa con matriz de programación dinámica.
 *
 * @param a - Primera cadena a comparar.
 * @param b - Segunda cadena a comparar.
 * @returns Número mínimo de ediciones (inserción, eliminación, sustitución).
 */
function levenshtein(a: string, b: string): number {
	const filas = a.length + 1;
	const cols = b.length + 1;
	const matriz: number[][] = Array.from({ length: filas }, (_, i) =>
		Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
	);

	for (let i = 1; i < filas; i++) {
		for (let j = 1; j < cols; j++) {
			const costo = a[i - 1] === b[j - 1] ? 0 : 1;
			matriz[i][j] = Math.min(
				(matriz[i - 1][j] ?? 0) + 1,
				(matriz[i][j - 1] ?? 0) + 1,
				(matriz[i - 1][j - 1] ?? 0) + costo,
			);
		}
	}

	return matriz[a.length]?.[b.length] ?? 0;
}

/**
 * Corrige el TLD del dominio si coincide con un typo conocido de ".com".
 *
 * @param dominio - Dominio a evaluar (ej. "gmail.co").
 * @returns Dominio con TLD corregido, o `null` si no hay corrección aplicable.
 */
function corregirTld(dominio: string): string | null {
	for (const [typo, correcto] of Object.entries(TLD_TYPOS)) {
		if (dominio.endsWith(typo)) {
			const base = dominio.slice(0, -typo.length);
			return `${base}${correcto}`;
		}
	}
	return null;
}

/**
 * Sugiere una corrección si detecta un typo probable en el dominio del email.
 *
 * Reglas (en orden de prioridad):
 * 1. Si el dominio ya es uno de los conocidos → `null` (no molestar).
 * 2. Si el TLD es un typo conocido de ".com" → sugerir con ".com".
 * 3. Si la distancia de Levenshtein al dominio más cercano es ≤ 2 → sugerir ese dominio.
 * 4. Si el dominio es desconocido y lejano (ej. empresa.pe) → `null`.
 *
 * @param email - Email ingresado por el usuario (ej. "user@gmial.com").
 * @returns Email corregido (ej. "user@gmail.com") o `null` si no hay sugerencia.
 */
export function suggestEmailCorrection(email: string): string | null {
	const arrobaIdx = email.lastIndexOf("@");
	if (arrobaIdx === -1) return null;

	const local = email.slice(0, arrobaIdx);
	const dominio = email.slice(arrobaIdx + 1).toLowerCase();

	if ((DOMINIOS_CONOCIDOS as readonly string[]).includes(dominio)) return null;

	const correccionTld = corregirTld(dominio);
	if (correccionTld !== null) {
		return `${local}@${correccionTld}`;
	}

	let dominioMasCercano: string | null = null;
	let distanciaMinima = Number.MAX_SAFE_INTEGER;

	for (const conocido of DOMINIOS_CONOCIDOS) {
		const dist = levenshtein(dominio, conocido);
		if (dist < distanciaMinima) {
			distanciaMinima = dist;
			dominioMasCercano = conocido;
		}
	}

	if (distanciaMinima <= 2 && dominioMasCercano !== null) {
		return `${local}@${dominioMasCercano}`;
	}

	return null;
}
