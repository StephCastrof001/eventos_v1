import Image from "next/image";
import { notFound } from "next/navigation";
import { MeshBg } from "@/components/mesh-bg";
import { RegisterForm } from "@/components/register-form";
import logo from "@/Logo/hackia_primary_dark.svg";
import { getEventBySlug } from "@/lib/events";

// Página pública del evento (#13). Server Component: lee el evento y muestra el form.
export default async function EventPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const event = await getEventBySlug(slug);
	if (!event) notFound();

	// Formatear rango de fechas (ej: miércoles, 22 de julio 8:30 - 13:00)
	let dateStr = "";
	if (event.event_date) {
		const startDate = new Date(event.event_date);
		dateStr = startDate.toLocaleDateString("es-PE", {
			weekday: "long",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

		if (event.end_date) {
			const endDate = new Date(event.end_date);
			// Si es el mismo día, solo añadimos la hora de fin. Si es distinto, añadimos todo.
			if (startDate.toLocaleDateString() === endDate.toLocaleDateString()) {
				dateStr += ` - ${endDate.toLocaleTimeString("es-PE", {
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			} else {
				dateStr += ` hasta ${endDate.toLocaleDateString("es-PE", {
					weekday: "long",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			}
		}
	}

	// Mapa embebido sin API key: query por el nombre del lugar (clickable, "ver mapa más grande").
	const mapEmbed = event.location
		? `https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&z=15&output=embed`
		: null;

	return (
		<>
			<MeshBg />
			<main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-12 text-[#e8e8f0]">
				<header className="flex flex-col items-start gap-3">
					<Image src={logo} alt="HACK IA" height={26} className="w-auto" />
					<h1 className="text-3xl font-bold leading-tight tracking-tight">
						{event.name}
					</h1>
					{event.organizer && (
						<p className="text-sm text-white/50">Organiza {event.organizer}</p>
					)}

					{/* Meta chips: fecha + tipo de lugar */}
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

				{/* Lugar: mapa embebido + link directo al pin */}
				{event.location && (
					<section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
						{mapEmbed && (
							<iframe
								title={`Mapa de ${event.location}`}
								src={mapEmbed}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								className="h-44 w-full border-0 grayscale-[0.2]"
							/>
						)}
						<a
							href={event.location_url ?? mapEmbed ?? "#"}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/[0.04] hover:text-[#00cfaa]"
						>
							<span>📍</span>
							<span className="flex-1">{event.location}</span>
							<span className="text-xs text-white/40">Abrir en Maps ↗</span>
						</a>
					</section>
				)}

				{event.instructions && (
					<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75">
						<p className="mb-1 font-semibold text-white/90">ℹ️ Instrucciones</p>
						{event.instructions}
					</div>
				)}

				{/* Card del formulario */}
				<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
					<h2 className="mb-4 text-lg font-bold">Solicitar unirse</h2>
					<RegisterForm eventId={event.id} fields={event.form_fields ?? []} />
				</section>
			</main>
		</>
	);
}
