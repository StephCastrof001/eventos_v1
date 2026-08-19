"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MAX_PHOTO_BYTES } from "@/lib/photo";
import { shrinkImage } from "@/lib/shrink-image";

type Status = "idle" | "shrinking" | "sending" | "done" | "error";

/**
 * Mensajes para el invitado. El código crudo del API ("too_large") no le dice
 * qué hacer; en la puerta del evento nadie va a googlear qué significa.
 * Tuteo peruano (tú), no voseo: la comunidad es de Lima.
 */
const MESSAGES: Record<string, string> = {
	too_large: "La foto pesa demasiado. Prueba con otra o tómala de nuevo.",
	payload_too_large:
		"La foto pesa demasiado para subirla. Prueba con otra o tómala de nuevo.",
	invalid_type: "Ese formato no funciona. Sube una foto JPG, PNG o WEBP.",
	not_found: "Tu link no es válido. Abre el que te llegó por correo.",
	not_approved: "Tu registro todavía no está aprobado.",
	bad_request: "Faltó la foto. Elige un archivo e intenta de nuevo.",
};

function messageFor(code: string | null): string {
	return MESSAGES[code ?? ""] ?? "No se pudo subir la foto. Intenta de nuevo.";
}

/** Subida de foto self-service (#5). Postea formData a /api/photo con el magic_token. */
export function PhotoUpload({ magicToken }: { magicToken: string }) {
	const router = useRouter();
	const [status, setStatus] = useState<Status>("idle");
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const picked = form.get("file");
		if (!(picked instanceof File) || picked.size === 0) {
			setError(messageFor("bad_request"));
			setStatus("error");
			return;
		}

		setError(null);
		setStatus("shrinking");
		const file = await shrinkImage(picked);

		// Si el resize no pudo (formato raro, navegador viejo) y el original
		// sigue pasado de peso, avisamos acá en vez de gastar la subida.
		if (file.size > MAX_PHOTO_BYTES) {
			setError(messageFor("too_large"));
			setStatus("error");
			return;
		}

		form.set("file", file);
		form.set("magic_token", magicToken);
		setStatus("sending");

		const res = await fetch("/api/photo", { method: "POST", body: form }).catch(
			() => null,
		);
		if (!res) {
			setError("Se cortó la conexión. Revisa tu señal e intenta de nuevo.");
			setStatus("error");
			return;
		}
		// 413 lo devuelve la plataforma como texto plano, no JSON: parsearlo
		// dejaba al invitado con un "(error)" sin pista del tamaño.
		if (res.status === 413) {
			setError(messageFor("payload_too_large"));
			setStatus("error");
			return;
		}

		const json = await res.json().catch(() => null);
		if (res.ok && json?.ok) {
			// El invitado ya pasó a badge_ready: refrescamos para que el server
			// re-renderice la página con el badge (QR + descarga), sin reabrir el email.
			setStatus("done");
			router.refresh();
			return;
		}
		setError(messageFor(typeof json?.error === "string" ? json.error : null));
		setStatus("error");
	}

	if (status === "done") {
		return (
			<div className="flex flex-col items-center gap-3 rounded-lg border border-[#00cfaa]/40 bg-[#00cfaa]/10 p-4 text-[#e8e8f0]">
				<p>✅ Foto subida. Generando tu badge…</p>
			</div>
		);
	}

	const busy = status === "shrinking" || status === "sending";

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-3">
			{/* Aviso ANTES de elegir el archivo: el 413 de la plataforma llega
			    después de gastar la subida entera en 4G, y sin este texto el
			    invitado no tiene forma de saber que el problema fue el peso. */}
			<div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/60">
				<p className="mb-1 font-semibold text-white/80">
					📸 Antes de subir tu foto
				</p>
				<p>
					Recórtala cuadrada y de frente: entra mejor en el badge y pesa menos.
					Peso máximo{" "}
					<strong className="text-white/80">
						{MAX_PHOTO_BYTES / 1_000_000} MB
					</strong>
					. Si tu foto pesa más, la reducimos automáticamente en tu celular; si
					aun así falla la subida, es por tamaño: recórtala o saca una nueva.
				</p>
			</div>
			{/* Lista explícita a propósito: con `image/*` iOS puede mandar el HEIC
			    crudo; con esta lista convierte a JPEG al elegir de la galería. */}
			<input
				type="file"
				name="file"
				accept="image/jpeg,image/png,image/webp"
				required
				className="text-sm text-[#e8e8f0] file:mr-3 file:rounded-md file:border-0 file:bg-[#6f5ff2] file:px-3 file:py-2 file:text-white"
			/>
			<Button type="submit" disabled={busy}>
				{status === "shrinking"
					? "Preparando foto…"
					: status === "sending"
						? "Subiendo…"
						: "Subir foto"}
			</Button>
			{status === "error" && error && (
				<p className="text-sm text-red-400">{error}</p>
			)}
		</form>
	);
}
