"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FormField } from "@/lib/events";

type Status = "idle" | "sending" | "done" | "error";

const inputCls =
	"w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-[#e8e8f0] outline-none focus:border-[#6f5ff2]";

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
					setErrorMsg("Este correo ya está registrado para el evento o hubo un error.");
				} else if (data.error?.fieldErrors) {
					const firstKey = Object.keys(data.error.fieldErrors)[0];
					const firstErr = data.error.fieldErrors[firstKey]?.[0];
					setErrorMsg(`${firstKey}: ${firstErr}`);
				} else {
					setErrorMsg("Algo falló. Revisá los datos e intentá de nuevo.");
				}
			}
		} catch (err) {
			setStatus("error");
			setErrorMsg("Error de conexión. Intenta nuevamente.");
		}
	}

	if (status === "done") {
		return (
			<div className="rounded-lg border border-[#6f5ff2]/40 bg-[#6f5ff2]/10 p-4 text-[#e8e8f0]">
				✅ Tu inscripción está <strong>pendiente de aprobación</strong>. Te
				llegará un email cuando te aprueben.
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
			<Button type="submit" disabled={status === "sending"}>
				{status === "sending" ? "Enviando…" : "Solicitar unirse"}
			</Button>
			{status === "error" && (
				<p className="text-sm text-red-400">
					{errorMsg || "Algo falló. Revisá los datos e intentá de nuevo."}
				</p>
			)}
		</form>
	);
}
