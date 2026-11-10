import type { ChooserFilter, FileEntry } from '#lib/bindings.js';

const SPECIAL = /[.+^${}()|\\]/g;

function globPattern(glob: string) {
	const source = glob.replace(SPECIAL, '\\$&').replaceAll('*', '.*').replaceAll('?', '.');
	return new RegExp(`^${source}$`, 'i');
}

function matchesType(wanted: string, type: string | null) {
	if (!type) return false;
	return wanted.endsWith('/*') ? type.startsWith(wanted.slice(0, -1)) : wanted === type;
}

export function filterMatcher(filter: ChooserFilter) {
	const patterns = filter.patterns.map(globPattern);
	return (entry: FileEntry) =>
		entry.isDir || patterns.some((pattern) => pattern.test(entry.name)) || filter.mimeTypes.some((type) => matchesType(type, entry.mimeType));
}
