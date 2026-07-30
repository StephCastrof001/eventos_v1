import Image from "next/image";
import logo from "@/Logo/hackia_primary_dark.svg";
import type { EventRow } from "@/lib/events";
import { formatEventDateRange } from "@/lib/format-date";

/**
 * Cabecera del evento: logo, nombre, organizador, fecha y tipo de lugar.
 * Compartida entre /e/[slug] y /e/[slug]/agenda para que las dos páginas
 * muestren la misma fecha (siempre en hora de Lima, ver lib/format-date).
 */
export function EventHeader({ event }: { event: EventRow }) {
	const dateStr = formatEventDateRange(event.event_date, event.end_date);

	return (
		<header className="flex flex-col items-start gap-3">
			<Image src={logo} alt="HACK IA" height={26} className="w-auto" />
			<h1 className="text-3xl font-bold leading-tight tracking-tight">
				{event.name}
			</h1>
			{event.organizer && (
				<p className="text-sm text-white/50">Organiza {event.organizer}</p>
			)}

			<div className="flex flex-wrap gap-2">
				{dateStr && (
					<span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/80">
						🗓️ {dateStr}
					</span>
				)}
				{event.location_type && (
					<span className="inline-flex items-center rounded-full border border-[#6f5ff2]/30 bg-[#6f5ff2]/10 px-3 py-1 text-xs font-medium text-[#b9aefc]">
						{event.location_type}
					</span>
				)}
			</div>

			{event.description && (
				<p className="text-sm leading-relaxed text-white/70">
					{event.description}
				</p>
			)}
		</header>
	);
}
