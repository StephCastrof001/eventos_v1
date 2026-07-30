import { notFound } from "next/navigation";
import { EventAgenda } from "@/components/event/EventAgenda";
import { EventHeader } from "@/components/event/EventHeader";
import { EventLocation } from "@/components/event/EventLocation";
import { MeshBg } from "@/components/mesh-bg";
import { RegisterForm } from "@/components/register-form";
import { getEventBySlug } from "@/lib/events";

// Página pública del evento (#13). Server Component: lee el evento y muestra el form.
// La cabecera, el lugar y la agenda salen de components/event/*, compartidos con
// /e/[slug]/agenda (la versión sin formulario que linkean los recordatorios).
export default async function EventPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const event = await getEventBySlug(slug);
	if (!event) notFound();

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

				<EventAgenda agenda={event.agenda} />

				{/* Card del formulario */}
				<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
					<h2 className="mb-4 text-lg font-bold">Solicitar unirse</h2>
					<RegisterForm eventId={event.id} fields={event.form_fields ?? []} />
				</section>
			</main>
		</>
	);
}
