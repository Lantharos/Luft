import * as api from '#lib/api.js';
import { settings } from '#lib/state/settings.svelte.js';
import type { FileEntry, PinnedFolder } from '#lib/types/index.js';
import { entryIcon } from '#lib/utils/file-kinds.js';

export function isPinned(path: string) {
	return settings.value.pinnedFolders.some((bookmark) => bookmark.path === path);
}

export function pin(bookmarks: PinnedFolder[]) {
	settings.update((current) => {
		const known = new Set(current.pinnedFolders.map((bookmark) => bookmark.path));
		return { ...current, pinnedFolders: [...current.pinnedFolders, ...bookmarks.filter((bookmark) => !known.has(bookmark.path))] };
	});
}

export async function pinPaths(paths: string[], known: FileEntry[]) {
	const byPath = new Map(known.map((entry) => [entry.path, entry]));
	const entries = await Promise.all(paths.map((path) => byPath.get(path) ?? api.getFileInfo(path).catch(() => null)));
	pin(entries.filter((entry): entry is FileEntry => Boolean(entry)).map(bookmarkFor));
}

export function unpin(path: string) {
	settings.update((current) => ({
		...current,
		pinnedFolders: current.pinnedFolders.filter((bookmark) => bookmark.path !== path)
	}));
}

export function togglePinned(entry: FileEntry) {
	if (isPinned(entry.path)) unpin(entry.path);
	else pin([bookmarkFor(entry)]);
}

export function reorder(sourcePath: string, targetPath: string | null) {
	settings.update((current) => {
		const bookmarks = [...current.pinnedFolders];
		const sourceIndex = bookmarks.findIndex((bookmark) => bookmark.path === sourcePath);
		if (sourceIndex === -1) return current;
		const [moved] = bookmarks.splice(sourceIndex, 1);
		const targetIndex = targetPath ? bookmarks.findIndex((bookmark) => bookmark.path === targetPath) : -1;
		bookmarks.splice(targetIndex === -1 ? bookmarks.length : targetIndex, 0, moved);
		return { ...current, pinnedFolders: bookmarks };
	});
}

function bookmarkFor(entry: FileEntry): PinnedFolder {
	return { name: entry.name, path: entry.path, is_dir: entry.is_dir, icon: entryIcon(entry) };
}
