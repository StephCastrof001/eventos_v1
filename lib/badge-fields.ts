export function buildBadgeFields(g: {
	name: string;
	last_name?: string | null;
	role?: string | null;
	company?: string | null;
}): { displayName: string; subtitle: string } {
	const displayName = [g.name, g.last_name].filter(Boolean).join(" ").trim();
	const subtitle = [g.role, g.company].filter(Boolean).join(" · ").trim();

	return { displayName, subtitle };
}
