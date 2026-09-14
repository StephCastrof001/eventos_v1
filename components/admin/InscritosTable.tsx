"use client";

import { useMemo, useState } from "react";
import { marcarPagado } from "@/app/admin/curso/actions";
import type { InscritoRow } from "@/lib/api/cursos";

/** Texto contra el que se busca. Se concatena una vez por fila, no por tecla. */
function haystack(i: InscritoRow): string {
	return [
		i.nombres,
		i.apellidos,
		i.email,
		i.telefono,
		i.dni,
		i.centro_labores,
		i.cargo,
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
}

/** Quita tildes para que "jose" encuentre a "José". */
function normalize(s: string): string {
	return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function CheckPagado({
	inscrito,
	slug,
}: {
	inscrito: InscritoRow;
	slug: string;
}) {
	return (
		<form action={marcarPagado.bind(null, inscrito.id, slug, !inscrito.pagado)}>
			<button
				type="submit"
				aria-pressed={inscrito.pagado}
				className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
					inscrito.pagado
						? "bg-[#00cfaa]/15 text-[#00cfaa] hover:bg-[#00cfaa]/25"
						: "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
				}`}
			>
				{inscrito.pagado ? "✓ Pagado" : "Marcar pagado"}
			</button>
		</form>
	);
}

export function InscritosTable({
	inscritos,
	slug,
}: {
	inscritos: InscritoRow[];
	slug: string;
}) {
	const [query, setQuery] = useState("");
	const [soloPendientes, setSoloPendientes] = useState(false);

	const indexed = useMemo(
		() => inscritos.map((i) => ({ i, text: normalize(haystack(i)) })),
		[inscritos],
	);

	const filtered = useMemo(() => {
		const terms = normalize(query.toLowerCase()).split(/\s+/).filter(Boolean);
		return indexed
			.filter((r) => terms.every((t) => r.text.includes(t)))
			.map((r) => r.i)
			.filter((i) => !soloPendientes || !i.pagado);
	}, [indexed, query, soloPendientes]);

	const pagados = inscritos.filter((i) => i.pagado).length;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Buscar por nombre, email, WhatsApp, DNI..."
					aria-label="Buscar inscritos"
					className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-base text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#6f5ff2] sm:max-w-sm sm:text-sm"
				/>
				<div className="flex items-center gap-4 text-xs text-white/40">
					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={soloPendientes}
							onChange={(e) => setSoloPendientes(e.target.checked)}
						/>
						Solo sin pagar
					</label>
					<span>
						{pagados} pagados de {inscritos.length}
					</span>
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-2xl backdrop-blur-xl">
				{/* Mobile: tarjetas. Siete columnas no entran en un celular. */}
				<ul className="divide-y divide-white/[0.04] md:hidden">
					{filtered.map((i) => (
						<li key={i.id} className="flex flex-col gap-2 p-4">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="font-medium text-white">
										{i.nombres} {i.apellidos ?? ""}
									</p>
									<p className="truncate font-mono text-xs text-white/50">
										{i.email}
									</p>
								</div>
								<CheckPagado inscrito={i} slug={slug} />
							</div>
							<div className="text-xs text-white/40">
								<p>📱 {i.telefono}</p>
								{i.dni && <p>🪪 {i.dni}</p>}
								{i.centro_labores && (
									<p className="truncate">
										🏢 {i.centro_labores}
										{i.cargo ? ` — ${i.cargo}` : ""}
									</p>
								)}
							</div>
						</li>
					))}
				</ul>

				{/* Desktop: tabla */}
				<div className="hidden overflow-x-auto md:block">
					<table className="w-full border-collapse whitespace-nowrap text-left">
						<thead>
							<tr className="border-b border-white/[0.05] bg-white/[0.03]">
								{["Inscrito", "Contacto", "Trabajo", "Pago"].map((h) => (
									<th
										key={h}
										className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-white/[0.02]">
							{filtered.map((i) => (
								<tr
									key={i.id}
									className="group transition-colors hover:bg-white/[0.04]"
								>
									<td className="px-6 py-4">
										<div className="font-medium text-white">
											{i.nombres} {i.apellidos ?? ""}
										</div>
										{i.dni && (
											<div className="mt-0.5 text-xs text-white/40">
												🪪 {i.dni}
											</div>
										)}
									</td>
									<td className="px-6 py-4 font-mono text-sm text-white/50">
										{i.email}
										<div className="mt-0.5 text-xs">📱 {i.telefono}</div>
									</td>
									<td className="px-6 py-4 text-sm text-white/50">
										{i.centro_labores ?? "--"}
										{i.cargo && (
											<div className="mt-0.5 text-xs text-white/40">
												{i.cargo}
											</div>
										)}
									</td>
									<td className="px-6 py-4">
										<CheckPagado inscrito={i} slug={slug} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{filtered.length === 0 && (
					<p className="p-12 text-center text-white/30">
						{inscritos.length === 0
							? "Todavía no hay inscritos."
							: "Ningún inscrito coincide con la búsqueda."}
					</p>
				)}
			</div>
		</div>
	);
}
