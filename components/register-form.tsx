"use client";

import { useState } from "react";
import type { FormField } from "@/lib/events";

type Status = "idle" | "sending" | "done" | "error";

const inputCls =
	"w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#e8e8f0] placeholder:text-white/40 outline-none transition-colors focus:border-[#6f5ff2] focus:bg-white/[0.06] focus:ring-2 focus:ring-[#6f5ff2]/30";

/** Form de registro (#14). Core fijo + campos configurables por evento (P2). Postea a /api/register (P7). */
export function RegisterForm({
	eventId,
	fields,
}: {
	eventId: string;
	fields: FormField[];
}) {
	const [values, setValues] = useState<Record<string, string>>({});
	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const set = (k: string, v: string) =>
		setValues((prev) => ({ ...prev, [k]: v }));

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStatus("sending");
		setErrorMsg(null);
		try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ eventId, ...values }),
			});
			const data = await res.json();
			if (res.ok) {
				setStatus("done");
			} else {
				setStatus("error");
				if (data.error === "register_failed") {
					setErrorMsg(
						"Este correo ya está registrado para el evento o hubo un error.",
					);
				} else if (data.error?.fieldErrors) {
					const firstKey = Object.keys(data.error.fieldErrors)[0];
					const firstErr = data.error.fieldErrors[firstKey]?.[0];
					setErrorMsg(`${firstKey}: ${firstErr}`);
				} else {
					setErrorMsg("Algo falló. Revisá los datos e intentá de nuevo.");
				}
			}
		} catch {
			setStatus("error");
			setErrorMsg("Error de conexión. Intenta nuevamente.");
		}
	}

	if (status === "done") {
		return (
			<div className="flex flex-col items-center gap-3 rounded-2xl border border-[#00cfaa]/30 bg-[#00cfaa]/[0.07] p-6 text-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00cfaa]/15 text-2xl">
					✓
				</div>
				<p className="text-[#e8e8f0]">
					Tu inscripción está{" "}
					<strong className="text-[#00cfaa]">pendiente de aprobación</strong>.
				</p>
				<p className="text-sm text-white/60">
					Te llega un email con tu acceso cuando te aprueben.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-3">
			<input
				className={inputCls}
				placeholder="Nombres *"
				required
				onChange={(e) => set("name", e.target.value)}
			/>
			<input
				className={inputCls}
				placeholder="Apellidos"
				onChange={(e) => set("last_name", e.target.value)}
			/>
			<input
				className={inputCls}
				type="email"
				placeholder="Email *"
				required
				onChange={(e) => set("email", e.target.value)}
			/>
			{fields.map((f) => (
				<input
					key={f.key}
					className={inputCls}
					type={f.type}
					placeholder={f.required ? `${f.label} *` : f.label}
					required={f.required}
					onChange={(e) => set(f.key, e.target.value)}
				/>
			))}
			<button
				type="submit"
				disabled={status === "sending"}
				className="mt-1 w-full rounded-xl bg-[#6f5ff2] px-4 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(111,95,242,0.35)] transition-all hover:bg-[#5a4be0] hover:shadow-[0_0_32px_rgba(111,95,242,0.5)] disabled:opacity-60 disabled:shadow-none"
			>
				{status === "sending" ? "Enviando…" : "Solicitar unirse"}
			</button>
			{status === "error" && (
				<p className="text-sm text-red-400">
					{errorMsg || "Algo falló. Revisá los datos e intentá de nuevo."}
				</p>
			)}
		</form>
	);
}
