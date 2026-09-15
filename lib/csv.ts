/** Caracteres con los que Excel lee una celda como fórmula y no como texto. */
const INICIO_DE_FORMULA = ["=", "+", "-", "@", "\t", "\r"];

/**
 * Prepara un valor para una celda de CSV. Hace dos cosas:
 *
 * 1. Lo envuelve en comillas y escapa las internas, para que una empresa o un
 *    cargo con coma no parta la fila en dos columnas.
 * 2. Neutraliza la inyección de fórmulas. Estos campos los tipea el invitado en
 *    el formulario público: si alguien pone =HYPERLINK("http://...") como su
 *    cargo, Excel ejecuta esa fórmula al abrir el archivo, en la máquina del
 *    organizador que descargó la lista. Anteponer una comilla simple obliga a
 *    Excel a tratarlo como texto y a mostrarlo tal cual.
 */
export function celdaCsv(valor: unknown): string {
	let texto = String(valor ?? "");
	if (INICIO_DE_FORMULA.some((c) => texto.startsWith(c))) {
		texto = `'${texto}`;
	}
	return `"${texto.replace(/"/g, '""')}"`;
}

/** Arma el CSV completo: cabeceras + filas, una fila por línea. */
export function armarCsv(
	cabeceras: string[],
	filas: readonly unknown[][],
): string {
	return [cabeceras, ...filas]
		.map((fila) => fila.map(celdaCsv).join(","))
		.join("\n");
}
