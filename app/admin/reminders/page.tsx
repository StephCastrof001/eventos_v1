import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getEvents, getReminderLog } from "@/lib/api/admin";

export const dynamic = "force-dynamic";

/** Fecha y hora del envío en horario de Lima, para leerla sin traducir husos. */
function formatSentAt(iso: string): string {
	return new Date(iso).toLocaleString("es-PE", { timeZone: "America/Lima" });
}

/**
 * Bitácora de recordatorios (migración 0005): qué se mandó, a quién, cuándo y
 * si salió bien. Responde "¿le llegó el recordatorio a fulano?" sin entrar a
 * Supabase. Si un día esperado no tiene filas, el cron no corrió.
 */
export default async function RemindersLogPage(props: {
	searchParams: Promise<{ eventId?: string }>;
}) {
	try {
		await requireAdmin();
	} catch {
		redirect("/admin/login");
	}

	const { eventId } = await props.searchParams;
	const events = await getEvents();
	const selected = eventId ?? events?.[0]?.id;
	const log = selected ? await getReminderLog(selected) : [];

	const fallidos = log.filter((r) => !r.ok).length;

	return (
		<div className="min-h-screen bg-[#0c0c14] p-6 text-[#e8e8f0] md:p-12">
			<div className="mx-auto max-w-5xl">
				<header className="mb-8">
					<Link
						href="/admin"
						className="text-sm text-white/50 hover:text-[#00cfaa]"
					>
						← Volver al panel
					</Link>
					<h1 className="mt-3 text-3xl font-extrabold tracking-tight">
						Bitácora de recordatorios
					</h1>
					<p className="mt-2 text-white/50">
						{log.length} envío{log.length === 1 ? "" : "s"} registrado
						{log.length === 1 ? "" : "s"}
						{fallidos > 0 && (
							<span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300">
								{fallidos} con error
							</span>
						)}
					</p>
				</header>

				{/* Selector de evento */}
				<nav className="mb-6 flex flex-wrap gap-2">
					{(events ?? []).map((e) => (
						<Link
							key={e.id}
							href={`/admin/reminders?eventId=${e.id}`}
							className={`rounded-full border px-3 py-1 text-xs transition-colors ${
								e.id === selected
									? "border-[#6f5ff2] bg-[#6f5ff2]/20 text-[#b9aefc]"
									: "border-white/10 text-white/60 hover:border-white/30"
							}`}
						>
							{e.name}
						</Link>
					))}
				</nav>

				{log.length === 0 ? (
					<p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
						Todavía no se envió ningún recordatorio para este evento. Si
						esperabas uno hoy, el cron no corrió.
					</p>
				) : (
					<div className="overflow-x-auto rounded-2xl border border-white/10">
						<table className="w-full min-w-[720px] text-left text-sm">
							<thead className="bg-white/[0.04] text-xs uppercase text-white/50">
								<tr>
									<th className="px-4 py-3">Cuándo</th>
									<th className="px-4 py-3">Invitado</th>
									<th className="px-4 py-3">Correo</th>
									<th className="px-4 py-3">Recordatorio</th>
									<th className="px-4 py-3">Resultado</th>
								</tr>
							</thead>
							<tbody>
								{log.map((r) => (
									<tr key={r.id} className="border-t border-white/5">
										<td className="whitespace-nowrap px-4 py-3 text-white/70">
											{formatSentAt(r.sent_at)}
										</td>
										<td className="px-4 py-3">{r.guests?.name ?? "—"}</td>
										<td className="px-4 py-3 text-white/70">{r.email}</td>
										<td className="whitespace-nowrap px-4 py-3 text-white/70">
											{r.offset_days === 1
												? "1 día antes"
												: `${r.offset_days} días antes`}
										</td>
										<td className="px-4 py-3">
											{r.ok ? (
												<span
													className="text-[#00cfaa]"
													title={r.provider_id ?? undefined}
												>
													✅ Enviado
												</span>
											) : (
												<span className="text-red-300" title={r.error ?? ""}>
													❌ {r.error ?? "error"}
												</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
