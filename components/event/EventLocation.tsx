import type { EventRow } from "@/lib/events";

/** Mapa embebido sin API key: query por el nombre del lugar. */
export function mapEmbedUrl(location?: string | null): string | null {
	if (!location) return null;
	return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`;
}

/**
 * Lugar del evento: mapa embebido + link directo al pin en Maps.
 * Compartido entre /e/[slug] y /e/[slug]/agenda.
 */
export function EventLocation({ event }: { event: EventRow }) {
	if (!event.location) return null;
	const embed = mapEmbedUrl(event.location);

	return (
		<section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
			{embed && (
				<iframe
					title={`Mapa de ${event.location}`}
					src={embed}
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
					className="h-44 w-full border-0 grayscale-[0.2]"
				/>
			)}
			<a
				href={event.location_url ?? embed ?? "#"}
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/[0.04] hover:text-[#00cfaa]"
			>
				<span>📍</span>
				<span className="flex-1">{event.location}</span>
				<span className="text-xs text-white/40">Abrir en Maps ↗</span>
			</a>
		</section>
	);
}
