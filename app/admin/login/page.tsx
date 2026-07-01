"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

/**
 * Login admin con contraseña compartida (email + password del equipo).
 * Solo emails en ADMIN_EMAILS pasan el gate del dashboard (requireAdmin).
 * Passwordless (magic link) se reemplazó por password: sin trip al inbox.
 */
export default function AdminLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const sb = createBrowserSupabase();
		const { error } = await sb.auth.signInWithPassword({ email, password });
		setLoading(false);
		if (error) {
			setError("Email o contraseña incorrectos.");
			return;
		}
		// Sesión seteada en cookies (SSR). El gate de allowlist corre en /admin.
		router.push("/admin");
		router.refresh();
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#0c0c14] text-[#e8e8f0] p-4">
			<div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900/40 p-8">
				<h1 className="text-2xl font-bold mb-2">Acceso admin</h1>
				<p className="text-sm text-gray-400 mb-6">
					Ingresá con el correo y la contraseña del equipo.
				</p>

				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="tu@email.com"
						autoComplete="username"
						className="rounded-lg bg-[#14141f] border border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-[#6f5ff2]"
					/>
					<input
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Contraseña"
						autoComplete="current-password"
						className="rounded-lg bg-[#14141f] border border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-[#6f5ff2]"
					/>
					<button
						type="submit"
						disabled={loading}
						className="rounded-lg bg-[#6f5ff2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5a4be0] disabled:opacity-60"
					>
						{loading ? "Ingresando..." : "Entrar"}
					</button>
					{error ? <p className="text-red-400 text-sm">{error}</p> : null}
				</form>
			</div>
		</div>
	);
}
