import { notFound } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
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

	const date = event.event_date
		? new Date(event.event_date).toLocaleDateString("es-PE", {
				dateStyle: "long",
			})
		: null;

	return (
		<main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 bg-[#0c0c14] px-5 py-12 text-[#e8e8f0]">
			<header className="flex flex-col gap-1">
				<p className="text-xs uppercase tracking-widest text-[#00cfaa]">
					HACK IA
				</p>
				<h1 className="text-3xl font-bold">{event.name}</h1>
				{event.organizer && (
					<p className="text-sm text-white/60">Organiza: {event.organizer}</p>
				)}
				{date && <p className="text-sm text-white/60">{date}</p>}
				{event.location && (
					<p className="text-sm text-white/60">{event.location}</p>
				)}
				{event.description && (
					<p className="mt-2 text-sm text-white/80">{event.description}</p>
				)}
			</header>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">Solicitar unirse</h2>
				<RegisterForm eventId={event.id} fields={event.form_fields ?? []} />
			</section>
		</main>
	);
}
