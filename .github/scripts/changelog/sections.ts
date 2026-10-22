const AREAS = ['desktop', 'apps', 'system', 'installing'] as const;

export type Area = (typeof AREAS)[number];
export type Place = { area: Area; title: string };
export type Section = Place & { changes: string[] };

const key = ({ area, title }: Place) => `${area}/${title}`;

function order(left: Place, right: Place) {
	return AREAS.indexOf(left.area) - AREAS.indexOf(right.area) || (left.title < right.title ? -1 : left.title > right.title ? 1 : 0);
}

export function merge(lists: Section[][]): Section[] {
	const merged = new Map<string, Section>();
	for (const section of lists.flat()) {
		const existing = merged.get(key(section));
		if (existing) existing.changes.push(...section.changes);
		else merged.set(key(section), { ...section, changes: [...section.changes] });
	}
	return [...merged.values()].sort(order);
}

export function markdown(sections: Section[]): string {
	return sections.map(({ title, changes }) => `## ${title}\n\n${changes.map((change) => `- ${change}`).join('\n')}\n`).join('\n');
}

export function busiest(places: Place[]): Place | undefined {
	const counts = new Map<string, { place: Place; count: number }>();
	for (const place of places) {
		const entry = counts.get(key(place)) ?? { place, count: 0 };
		entry.count += 1;
		counts.set(key(place), entry);
	}
	return [...counts.values()].sort((left, right) => right.count - left.count || order(left.place, right.place))[0]?.place;
}
