"use client";

import { useMemo, useState } from "react";
import { approveGuest, rejectGuest } from "@/app/admin/actions";
import { statusLabel } from "@/lib/status-label";

/** Fila de invitado que la tabla del admin necesita mostrar. */
interface GuestRow {
	id: string;
	name: string;
	last_name?: string | null;
	email: string;
	phone?: string | null;
	company?: string | null;
	role?: string | null;
	status: string;
}

/** Clases del pill de estado por color lógico de `statusLabel`. */
const STATUS_STYLES: Record<string, string> = {
	green: "bg-[#00cfaa]/10 text-[#00cfaa] border-[#00cfaa]/20",
	teal: "bg-[#00cfaa]/20 text-[#00cfaa] border-[#00cfaa]/40",
	purple: "bg-[#6f5ff2]/15 text-[#a99bff] border-[#6f5ff2]/30",
	amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	red: "bg-red-500/10 text-red-400 border-red-500/20",
	gray: "bg-white/5 text-white/40 border-white/10",
};

/**
 * Texto contra el que se busca. Concatenar una sola vez por fila evita
 * recorrer campo por campo en cada tecla.
 */
function haystack(g: GuestRow): string {
	return [g.name, g.last_name, g.email, g.company, g.role, g.phone]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
}

/** Quita tildes para que "jose" encuentre a "José". */
function normalize(s: string): string {
	return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function StatusPill({ status }: { status: string }) {
	const { text, color } = statusLabel(status);
	return (
		<span
			className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
				STATUS_STYLES[color] ?? STATUS_STYLES.gray
			}`}
		>
			{text}
		</span>
	);
}

function Actions({ guest, eventId }: { guest: GuestRow; eventId: string }) {
	if (guest.status !== "registered") {
		return <span className="text-sm text-white/20">--</span>;
	}
	return (
		<div className="flex items-center gap-2">
			<form action={approveGuest.bind(null, guest.id, eventId)}>
				<button
					type="submit"
					className="rounded-lg bg-[#6f5ff2] px-4 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(111,95,242,0.4)] transition-all hover:bg-[#5b4be0] active:scale-95"
				>
					Aprobar
				</button>
			</form>
			<form action={rejectGuest.bind(null, guest.id, eventId)}>
				<button
					type="submit"
					aria-label="Rechazar"
					className="rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-400"
				>
					✕
				</button>
			</form>
		</div>
	);
}

export function GuestTable({
	guests,
	eventId,
}: {
	guests: GuestRow[];
	eventId: string;
}) {
	const [query, setQuery] = useState("");

	const indexed = useMemo(
		() =>
			(guests ?? []).map((g) => ({ guest: g, text: normalize(haystack(g)) })),
		[guests],
	);

	const filtered = useMemo(() => {
		const terms = normalize(query.toLowerCase()).split(/\s+/).filter(Boolean);
		if (terms.length === 0) return indexed.map((r) => r.guest);
		return indexed
			.filter((r) => terms.every((t) => r.text.includes(t)))
			.map((r) => r.guest);
	}, [indexed, query]);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full sm:max-w-sm">
					<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
						🔍
					</span>
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Buscar por nombre, email, empresa..."
						aria-label="Buscar invitados"
						className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-3 text-base text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#6f5ff2] sm:text-sm"
					/>
				</div>
				<p className="text-xs text-white/40">
					{filtered.length === guests?.length
						? `${guests?.length ?? 0} invitados`
						: `${filtered.length} de ${guests?.length ?? 0}`}
				</p>
			</div>

			<div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-2xl backdrop-blur-xl">
				{/* Mobile: tarjetas. Una tabla de 4 columnas con nowrap obliga a
				    scrollear de lado en un celular; la tarjeta apila y entra sola. */}
				<ul className="divide-y divide-white/[0.04] md:hidden">
					{filtered.map((guest) => (
						<li key={guest.id} className="flex flex-col gap-2 p-4">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="font-medium text-white">
										{guest.name} {guest.last_name || ""}
									</p>
									<p className="truncate font-mono text-xs text-white/50">
										{guest.email}
									</p>
								</div>
								<StatusPill status={guest.status} />
							</div>
							{(guest.company || guest.phone) && (
								<div className="text-xs text-white/40">
									{guest.company && (
										<p className="truncate">
											🏢 {guest.company}
											{guest.role ? ` - ${guest.role}` : ""}
										</p>
									)}
									{guest.phone && <p>📱 {guest.phone}</p>}
								</div>
							)}
							{guest.status === "registered" && (
								<Actions guest={guest} eventId={eventId} />
							)}
						</li>
					))}
				</ul>

				{/* Desktop: tabla */}
				<div className="hidden overflow-x-auto md:block">
					<table className="w-full border-collapse whitespace-nowrap text-left">
						<thead>
							<tr className="border-b border-white/[0.05] bg-white/[0.03]">
								<th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
									Invitado
								</th>
								<th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
									Email
								</th>
								<th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
									Estado
								</th>
								<th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/40">
									Acción
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/[0.02]">
							{filtered.map((guest) => (
								<tr
									key={guest.id}
									className="group transition-colors hover:bg-white/[0.04]"
								>
									<td className="px-6 py-4">
										<div className="font-medium text-white transition-colors group-hover:text-[#6f5ff2]">
											{guest.name} {guest.last_name || ""}
										</div>
										{guest.company && (
											<div className="mt-0.5 text-xs text-white/40">
												🏢 {guest.company} {guest.role ? `- ${guest.role}` : ""}
											</div>
										)}
									</td>
									<td className="px-6 py-4 font-mono text-sm text-white/50">
										{guest.email}
										{guest.phone && (
											<div className="mt-0.5 text-xs">📱 {guest.phone}</div>
										)}
									</td>
									<td className="px-6 py-4">
										<StatusPill status={guest.status} />
									</td>
									<td className="px-6 py-4">
										<div className="flex justify-end">
											<Actions guest={guest} eventId={eventId} />
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{filtered.length === 0 && (
					<div className="flex flex-col items-center justify-center px-6 py-12 text-center text-white/30">
						<span className="mb-3 text-4xl">{query ? "🔍" : "📭"}</span>
						<p>
							{query
								? `Ningún invitado coincide con "${query}".`
								: "Nadie se ha registrado todavía."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
