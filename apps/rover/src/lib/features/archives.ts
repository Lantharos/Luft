import type { FileEntry } from '$lib/types';

const SUFFIXES = [
	'.zip', '.jar', '.cbz', '.epub', '.apk', '.7z',
	'.tar', '.tar.gz', '.tgz', '.tar.bz2', '.tbz2', '.tar.xz', '.txz', '.tar.zst', '.tzst',
	'.gz', '.bz2', '.xz', '.zst'
];

export function isArchive(name: string) {
	const lowered = name.toLowerCase();
	return SUFFIXES.some((suffix) => lowered.endsWith(suffix) && lowered.length > suffix.length);
}

export function archiveName(entries: Pick<FileEntry, 'name' | 'is_dir'>[]) {
	if (entries.length !== 1) return 'Archive';
	const [{ name, is_dir }] = entries;
	const dot = name.lastIndexOf('.');
	return is_dir || dot <= 0 ? name : name.slice(0, dot);
}
