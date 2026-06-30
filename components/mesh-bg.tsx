/**
 * Fondo "Dark-tech Mesh" — glows radiales primary/accent sobre el canvas negro.
 * Mismo lenguaje visual que el badge (satori). Cohesión form → magic link → badge.
 * Decorativo: pointer-events-none + aria-hidden.
 */
export function MeshBg() {
	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0c0c14]"
		>
			<div className="absolute -left-1/4 -top-1/3 h-[520px] w-[520px] rounded-full bg-[#6f5ff2]/25 blur-[130px]" />
			<div className="absolute -bottom-1/3 -right-1/4 h-[520px] w-[520px] rounded-full bg-[#00cfaa]/16 blur-[130px]" />
			<div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6f5ff2]/8 blur-[120px]" />
		</div>
	);
}
