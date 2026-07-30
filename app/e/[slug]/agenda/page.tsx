import Link from "next/link";
import { notFound } from "next/navigation";
import { EventAgenda } from "@/components/event/EventAgenda";
import { EventHeader } from "@/components/event/EventHeader";
import { EventLocation } from "@/components/event/EventLocation";
import { MeshBg } from "@/components/mesh-bg";
import { getEventBySlug } from "@/lib/events";

/**
 * Página de agenda del evento: fecha, lugar y paneles, SIN el formulario de
 * inscripción. Es el destino del botón "Ver agenda" de los recordatorios, para
 * que un invitado ya aprobado no aterrice en un "Solicitar unirse" que ya hizo.
 *
 * Lee el mismo events.<slug> que /e/[slug]: una sola fuente de verdad, así la
 * agenda nunca queda desincronizada entre las dos páginas.
 */
export default async function EventAgendaPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const event = await getEventBySlug(slug);
	if (!event) notFound();

	const hasAgenda = (event.agenda?.length ?? 0) > 0;

	return (
		<>
			<MeshBg />
			<main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-12 text-[#e8e8f0]">
				<EventHeader event={event} />
				<EventLocation event={event} />

				{event.instructions && (
					<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75">
						<p className="mb-1 font-semibold text-white/90">ℹ️ Instrucciones</p>
						{event.instructions}
					</div>
				)}

				{hasAgenda ? (
					<EventAgenda agenda={event.agenda} />
				) : (
					<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
						La agenda se publica pronto. Volvé a entrar en unos días.
					</section>
				)}

				{/* Salida hacia la inscripción para quien todavía no se anotó. */}
				<p className="text-center text-sm text-white/50">
					¿Todavía no te inscribiste?{" "}
					<Link
						href={`/e/${slug}`}
						className="font-medium text-[#00cfaa] hover:underline"
					>
						Solicitar unirse →
					</Link>
				</p>
			</main>
		</>
	);
}
