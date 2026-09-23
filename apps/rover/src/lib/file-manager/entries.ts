import type { FileEntry, SortBy } from '$lib/types';

export function sortedEntries(items: FileEntry[], sortBy: SortBy, sortAsc: boolean) {
	return [...items].sort((a, b) => {
		if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;

		let comparison = 0;
		if (sortBy === 'name') comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
		if (sortBy === 'size') comparison = a.size - b.size;
		if (sortBy === 'date') comparison = (a.modified ?? 0) - (b.modified ?? 0);
		if (sortBy === 'type') comparison = (a.extension ?? '').localeCompare(b.extension ?? '');

		return sortAsc ? comparison : -comparison;
	});
}

export function visibleEntries(items: FileEntry[], query: string) {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return items;
	return items.filter((entry) => entry.name.toLowerCase().includes(normalized));
}
