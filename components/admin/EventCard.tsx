export function EventCard({
	ev,
}: {
	ev: { id: string; slug: string; name: string };
}) {
	return (
		<div className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#6f5ff2]/50 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(111,95,242,0.15)]">
			<div className="absolute inset-0 bg-gradient-to-br from-[#6f5ff2]/0 via-transparent to-[#6f5ff2]/0 group-hover:from-[#6f5ff2]/10 transition-all duration-500 pointer-events-none" />

			{/* Botón escáner (staff-only) — fuera del <a> del dashboard para no anidar links */}
			<a
				href={`/scan?eventId=${ev.id}`}
				className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-lg bg-[#6f5ff2] px-3 py-1.5 text-xs font-bold text-white shadow-[0_0_16px_rgba(111,95,242,0.35)] transition-all hover:bg-[#5a4be0]"
			>
				📷 Escanear
			</a>

			<a href={`/admin?eventId=${ev.id}`} className="relative z-10 block p-8">
				<div className="w-12 h-12 rounded-full bg-[#6f5ff2]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
					<span className="text-2xl">📅</span>
				</div>
				<h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#6f5ff2] transition-colors">
					{ev.name}
				</h2>
				<p className="text-sm text-white/40 font-mono">/{ev.slug}</p>
			</a>
		</div>
	);
}
