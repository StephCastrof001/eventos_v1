import { notFound, redirect } from "next/navigation";
import { InscritosTable } from "@/components/admin/InscritosTable";
import { getInscritos, getTallerBySlug } from "@/lib/api/cursos";
import { getEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Autorización: sesión válida + email en la allowlist. Igual que /admin. */
async function exigirAdmin(): Promise<void> {
	const auth = await createServerSupabase();
	const {
		data: { user },
	} = await auth.auth.getUser();

	if (!user?.email || !user.email_confirmed_at) redirect("/admin/login");

	const allowed = getEnv()
		.ADMIN_EMAILS.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (!allowed.includes(user.email.toLowerCase())) redirect("/admin/login");
}

export default async function CursoAdminPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	await exigirAdmin();

	const { slug } = await params;
	const taller = await getTallerBySlug(slug);
	if (!taller) notFound();

	const inscritos = await getInscritos(taller.id);
	const fecha = new Intl.DateTimeFormat("es-PE", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "America/Lima",
	}).format(new Date(taller.inicio_at));

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#0c0c14] p-4 font-sans text-[#e8e8f0] md:p-8">
			<div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-[#6f5ff2]/10 blur-[120px]" />

			<div className="relative z-10 mx-auto max-w-6xl">
				<header className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
					<div>
						<a
							href="/admin"
							className="text-sm text-white/40 transition-colors hover:text-white/70"
						>
							← Eventos
						</a>
						<h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-4xl">
							{taller.nombre}
						</h1>
						<p className="mt-1 text-white/50">
							{fecha} · {inscritos.length} inscritos
						</p>
					</div>

					<a
						href={`/admin/curso/${slug}/export`}
						className="self-start rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 md:self-center"
					>
						Descargar CSV
					</a>
				</header>

				<p className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-200/80">
					El pago se verifica en WhatsApp, no acá. Este check registra que
					alguien del equipo vio la captura del Yape — si hay discrepancia,
					manda el WhatsApp.
				</p>

				<InscritosTable inscritos={inscritos} slug={slug} />
			</div>
		</div>
	);
}
