import React from "react";

export function EventCard({
	ev,
}: {
	ev: { id: string; slug: string; name: string };
}) {
	return (
		<a
			href={`/admin?eventId=${ev.id}`}
			className="group relative block p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#6f5ff2]/50 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(111,95,242,0.15)]"
		>
			<div className="absolute inset-0 bg-gradient-to-br from-[#6f5ff2]/0 via-transparent to-[#6f5ff2]/0 group-hover:from-[#6f5ff2]/10 transition-all duration-500" />
			<div className="relative z-10">
				<div className="w-12 h-12 rounded-full bg-[#6f5ff2]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
					<span className="text-2xl">📅</span>
				</div>
				<h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#6f5ff2] transition-colors">
					{ev.name}
				</h2>
				<p className="text-sm text-white/40 font-mono">/{ev.slug}</p>
			</div>
		</a>
	);
}
