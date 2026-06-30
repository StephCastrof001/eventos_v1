import React from "react";
import { approveGuest, rejectGuest } from "@/app/admin/actions";

export function GuestTable({ guests, eventId }: { guests: any[]; eventId: string }) {
	return (
		<div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse whitespace-nowrap">
					<thead>
						<tr className="border-b border-white/[0.05] bg-white/[0.03]">
							<th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-white/40">Invitado</th>
							<th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-white/40">Email</th>
							<th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-white/40">Estado</th>
							<th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-white/40 text-right">Acción</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-white/[0.02]">
						{guests?.map((guest) => (
							<tr
								key={guest.id}
								className="group hover:bg-white/[0.04] transition-colors"
							>
								<td className="px-6 py-4">
									<div className="font-medium text-white group-hover:text-[#6f5ff2] transition-colors">
										{guest.name} {guest.last_name || ""}
									</div>
									{guest.company && (
										<div className="text-xs text-white/40 mt-0.5">
											🏢 {guest.company} {guest.role ? `- ${guest.role}` : ""}
										</div>
									)}
								</td>
								<td className="px-6 py-4 text-sm text-white/50 font-mono">
									{guest.email}
									{guest.phone && <div className="text-xs mt-0.5">📱 {guest.phone}</div>}
								</td>
								<td className="px-6 py-4">
									<span
										className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
											guest.status === "approved"
												? "bg-[#00cfaa]/10 text-[#00cfaa] border-[#00cfaa]/20 shadow-[0_0_10px_rgba(0,207,170,0.2)]"
												: guest.status === "rejected"
													? "bg-red-500/10 text-red-400 border-red-500/20"
													: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
										}`}
									>
										{guest.status === "registered" ? "pendiente" : guest.status}
									</span>
								</td>
								<td className="px-6 py-4 text-right">
									{guest.status === "registered" ? (
										<div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
											<form
												action={async () => {
													"use server";
													await approveGuest(guest.id, eventId);
												}}
											>
												<button
													type="submit"
													className="px-4 py-1.5 rounded-lg bg-[#6f5ff2] hover:bg-[#5b4be0] text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(111,95,242,0.4)]"
												>
													Aprobar
												</button>
											</form>
											<form
												action={async () => {
													"use server";
													await rejectGuest(guest.id, eventId);
												}}
											>
												<button
													type="submit"
													className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 text-sm font-medium transition-colors"
												>
													✕
												</button>
											</form>
										</div>
									) : (
										<span className="text-white/20 text-sm">--</span>
									)}
								</td>
							</tr>
						))}
						{!guests?.length && (
							<tr>
								<td colSpan={4} className="px-6 py-12 text-center">
									<div className="inline-flex flex-col items-center justify-center text-white/30">
										<span className="text-4xl mb-3">📭</span>
										<p>Nadie se ha registrado todavía.</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
