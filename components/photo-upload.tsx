"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "sending" | "done" | "error";

/** Subida de foto self-service (#5). Postea formData a /api/photo con el magic_token. */
export function PhotoUpload({ magicToken }: { magicToken: string }) {
	const [status, setStatus] = useState<Status>("idle");
	const [error, setError] = useState<string | null>(null);
	const [photoUrl, setPhotoUrl] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		form.set("magic_token", magicToken);
		setStatus("sending");
		setError(null);
		const res = await fetch("/api/photo", { method: "POST", body: form });
		const json = await res.json().catch(() => null);
		if (res.ok && json?.ok) {
			setPhotoUrl(json.photo_url);
			setStatus("done");
		} else {
			setError(json?.error ?? "error");
			setStatus("error");
		}
	}

	if (status === "done") {
		return (
			<div className="flex flex-col items-center gap-3 rounded-lg border border-[#00cfaa]/40 bg-[#00cfaa]/10 p-4 text-[#e8e8f0]">
				<p>✅ Foto subida. Tu badge está listo.</p>
				{photoUrl && (
					// biome-ignore lint/performance/noImgElement: preview simple, no Next/Image
					<img
						src={photoUrl}
						alt="Tu foto"
						className="h-32 w-32 rounded-full object-cover"
					/>
				)}
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-3">
			<input
				type="file"
				name="file"
				accept="image/jpeg,image/png,image/webp"
				required
				className="text-sm text-[#e8e8f0] file:mr-3 file:rounded-md file:border-0 file:bg-[#6f5ff2] file:px-3 file:py-2 file:text-white"
			/>
			<label className="flex items-start gap-2 text-xs text-white/70">
				<input
					type="checkbox"
					name="consent"
					value="true"
					required
					className="mt-0.5"
				/>
				Acepto que mi foto se use para generar mi badge del evento (Ley 29733).
			</label>
			<Button type="submit" disabled={status === "sending"}>
				{status === "sending" ? "Subiendo…" : "Subir foto"}
			</Button>
			{status === "error" && (
				<p className="text-sm text-red-400">
					No se pudo subir ({error}). Intentá de nuevo.
				</p>
			)}
		</form>
	);
}
