import type { FileEntry, PinnedFolder, Settings, UserDirs } from '$lib/types';
import { getFileIcon } from '$lib/utils';

type BookmarkSeed = { name: string; path: string | null; icon: string };

export function defaultSidebarBookmarks(dirs: UserDirs): PinnedFolder[] {
	const seeds: BookmarkSeed[] = [
		{ name: 'Desktop', path: dirs.desktop, icon: 'monitor' },
		{ name: 'Downloads', path: dirs.downloads, icon: 'download' },
		{ name: 'Documents', path: dirs.documents, icon: 'file-text' },
		{ name: 'Pictures', path: dirs.pictures, icon: 'image' },
		{ name: 'Music', path: dirs.music, icon: 'music' },
		{ name: 'Videos', path: dirs.videos, icon: 'video' }
	];

	return seeds
		.filter((item): item is BookmarkSeed & { path: string } => Boolean(item.path))
		.map((item) => ({ ...item, is_dir: true }));
}

export function ensureSidebarBookmarks(appSettings: Settings, dirs: UserDirs): Settings {
	if (appSettings.sidebarBookmarksInitialized) return appSettings;

	return {
		...appSettings,
		sidebarBookmarksInitialized: true,
		pinnedFolders: appSettings.pinnedFolders.length > 0 ? appSettings.pinnedFolders : defaultSidebarBookmarks(dirs)
	};
}

export function entryToSidebarBookmark(entry: FileEntry): PinnedFolder {
	return {
		name: entry.name,
		path: entry.path,
		is_dir: entry.is_dir,
		icon: bookmarkIconForEntry(entry)
	};
}

export function mergeSidebarBookmarks(current: PinnedFolder[], next: PinnedFolder[]) {
	const currentPaths = new Set(current.map((item) => item.path));
	return [...current, ...next.filter((item) => !currentPaths.has(item.path))];
}

export function bookmarkIconForEntry(entry: FileEntry) {
	const icon = getFileIcon(entry);
	if (icon === 'audio') return 'music';
	if (['pdf', 'document', 'spreadsheet', 'presentation'].includes(icon)) return 'file-text';
	if (icon === 'executable') return 'code';
	return ['folder', 'file', 'image', 'video', 'music', 'archive', 'code', 'package'].includes(icon) ? icon : 'file';
}
