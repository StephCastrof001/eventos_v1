import type { AgendaItem } from "@/lib/events";

/**
 * Ponentes del evento. La fuente es siempre events.agenda, así se edita sin
 * deploy. No renderiza nada si no hay nada cargado.
 *
 * `time` es opcional: cuando los bloques no llevan horario (lista de ponentes
 * a secas) se omite la columna en vez de dejar el hueco de w-14.
 */
export function EventAgenda({ agenda }: { agenda?: AgendaItem[] | null }) {
	if (!agenda || agenda.length === 0) return null;

	return (
		<section
			id="agenda"
			className="scroll-mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
		>
			<h2 className="mb-4 text-lg font-bold">Ponentes</h2>
			<ul className="flex flex-col gap-4">
				{agenda.map((item) => (
					<li
						key={`${item.time}-${item.title}`}
						className="flex items-start gap-3"
					>
						{item.time && (
							<span className="w-14 shrink-0 text-sm font-semibold text-[#00cfaa]">
								{item.time}
							</span>
						)}
						{item.photo_url && (
							// biome-ignore lint/performance/noImgElement: foto remota de panelista (Storage)
							<img
								src={item.photo_url}
								alt={item.speaker ?? ""}
								className="h-10 w-10 shrink-0 rounded-full object-cover"
							/>
						)}
						<div className="min-w-0">
							<p className="text-sm font-medium text-white/90">{item.title}</p>
							{item.speaker && (
								<p className="text-xs text-white/50">
									{item.speaker}
									{item.role ? ` · ${item.role}` : ""}
								</p>
							)}
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
