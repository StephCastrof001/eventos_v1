import { notFound } from "next/navigation";
import { EventAgenda } from "@/components/event/EventAgenda";
import { EventCommunity } from "@/components/event/EventCommunity";
import { EventHeader } from "@/components/event/EventHeader";
import { EventLocation } from "@/components/event/EventLocation";
import { MeshBg } from "@/components/mesh-bg";
import { getEventBySlug } from "@/lib/events";

/**
 * Página de agenda del evento: ponentes, lugar y canales de la comunidad.
 * Es el destino del CTA de los recordatorios, que van solo a invitados ya
 * aprobados: por eso no hay formulario ni salida hacia "Solicitar unirse".
 * Quien llega acá ya está dentro; ofrecerle inscribirse lo confunde.
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

				{/* La dirección va al final: primero el porqué (ponentes), después el dónde. */}
				<EventLocation event={event} />

				<EventCommunity brand={event.brand} />
			</main>
		</>
	);
}
