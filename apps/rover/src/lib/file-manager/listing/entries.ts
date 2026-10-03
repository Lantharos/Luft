import type { FileEntry, SortBy } from '#lib/types/index.js';

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

const comparators: Record<SortBy, (a: FileEntry, b: FileEntry) => number> = {
	name: (a, b) => collator.compare(a.name, b.name),
	size: (a, b) => a.size - b.size,
	date: (a, b) => (a.modified ?? 0) - (b.modified ?? 0),
	type: (a, b) => collator.compare(a.extension ?? '', b.extension ?? '') || collator.compare(a.name, b.name)
};

export function sortedEntries(items: FileEntry[], sortBy: SortBy, sortAsc: boolean) {
	const compare = comparators[sortBy];
	const direction = sortAsc ? 1 : -1;
	return items.toSorted((a, b) => {
		if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
		return compare(a, b) * direction;
	});
}

export function visibleEntries(items: FileEntry[], query: string) {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return items;
	return items.filter((entry) => entry.name.toLowerCase().includes(normalized));
}
