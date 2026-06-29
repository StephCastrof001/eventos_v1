export function buildSocialCaption(name?: string): string {
	const base = "Asistiré al lanzamiento de la comunidad HACK IA";
	if (name && name.trim().length > 0) {
		return `${name.trim()} — ${base}`;
	}
	return base;
}
