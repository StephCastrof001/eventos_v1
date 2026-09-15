import { describe, expect, it } from "vitest";
import { armarCsv, celdaCsv } from "./csv";

describe("celdaCsv", () => {
	// El motivo de este archivo: los campos los tipea cualquiera en el formulario
	// público, y Excel ejecuta al abrir todo lo que empieza con estos caracteres.
	it("desactiva una formula de Excel anteponiendo una comilla", () => {
		expect(celdaCsv('=HYPERLINK("http://malo","click")')).toBe(
			`"'=HYPERLINK(""http://malo"",""click"")"`,
		);
	});

	it("desactiva los cuatro prefijos peligrosos", () => {
		expect(celdaCsv("=1+1")).toBe(`"'=1+1"`);
		expect(celdaCsv("+51987654321")).toBe(`"'+51987654321"`);
		expect(celdaCsv("-Gerente")).toBe(`"'-Gerente"`);
		expect(celdaCsv("@canal")).toBe(`"'@canal"`);
	});

	it("desactiva tambien tabulacion y retorno de carro al inicio", () => {
		expect(celdaCsv("\t=1+1")).toBe(`"'\t=1+1"`);
		expect(celdaCsv("\r=1+1")).toBe(`"'\r=1+1"`);
	});

	it("no toca un valor normal", () => {
		expect(celdaCsv("Jefa de Producto")).toBe(`"Jefa de Producto"`);
		expect(celdaCsv("jose@ejemplo.com")).toBe(`"jose@ejemplo.com"`);
	});

	it("no se confunde con un igual que no esta al inicio", () => {
		expect(celdaCsv("Nivel = 3")).toBe(`"Nivel = 3"`);
	});

	it("escapa comillas duplicandolas", () => {
		expect(celdaCsv('Dijo "hola"')).toBe(`"Dijo ""hola"""`);
	});

	it("encierra la coma para que no parta la fila", () => {
		expect(celdaCsv("Gerente, de Marketing")).toBe(`"Gerente, de Marketing"`);
	});

	it("convierte null y undefined en celda vacia", () => {
		expect(celdaCsv(null)).toBe(`""`);
		expect(celdaCsv(undefined)).toBe(`""`);
	});
});

describe("armarCsv", () => {
	it("pone las cabeceras primero y una fila por linea", () => {
		const csv = armarCsv(
			["Nombre", "Cargo"],
			[
				["Ana", "Jefa de Producto"],
				["Luis", "=1+1"],
			],
		);
		expect(csv).toBe(
			['"Nombre","Cargo"', '"Ana","Jefa de Producto"', `"Luis","'=1+1"`].join(
				"\n",
			),
		);
	});

	it("una coma dentro de una celda no agrega una columna", () => {
		const csv = armarCsv(["A", "B"], [["x, y", "z"]]);
		// Tres comillas de apertura/cierre por celda, dos celdas: la coma interna
		// queda encerrada y el parser no la lee como separador.
		expect(csv.split("\n")[1]).toBe('"x, y","z"');
	});
});
