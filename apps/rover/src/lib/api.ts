import type {
	DirectoryContents,
	FileEntry,
	UserDirs,
	DriveList,
	DriveInfo,
	TrashContents,
	QueueStatus,
	Settings,
	FavoriteItem,
	PinnedFolder,
	BackgroundEffectStatus,
	ChooserConfig
} from './types';

async function invoke<T>(name: string, params?: Record<string, unknown>): Promise<T> {
	const bridge = await waitForBridge();
	return bridge.invoke<T>(name, params ?? {});
}

function waitForBridge(timeoutMs = 2500): Promise<FenestraBridge> {
	if (window.fenestra?.bridge) return Promise.resolve(window.fenestra.bridge);
	return new Promise((resolve, reject) => {
		const startedAt = performance.now();
		const poll = () => {
			if (window.fenestra?.bridge) {
				resolve(window.fenestra.bridge);
				return;
			}
			if (performance.now() - startedAt > timeoutMs) {
				reject(new Error('Rover desktop bridge is not available'));
				return;
			}
			window.setTimeout(poll, 16);
		};
		poll();
	});
}

function filePath(path: string): string {
	const trimmed = path.trim();
	if (!/%[0-9a-f]{2}/i.test(trimmed)) return trimmed;
	try {
		const decoded = decodeURIComponent(trimmed);
		return decoded.startsWith('/') ? decoded : trimmed;
	} catch {
		return trimmed;
	}
}

function filePaths(paths: string[]): string[] {
	return paths.map(filePath);
}

function favoriteItem(item: FavoriteItem): FavoriteItem {
	return { ...item, path: filePath(item.path) };
}

function pinnedFolder(folder: PinnedFolder): PinnedFolder {
	return { ...folder, path: filePath(folder.path) };
}

function appSettings(settings: Settings): Settings {
	return {
		...settings,
		folderViewModes: Object.fromEntries(Object.entries(settings.folderViewModes).map(([path, mode]) => [filePath(path), mode])),
		favorites: settings.favorites.map(favoriteItem),
		pinnedFolders: settings.pinnedFolders.map(pinnedFolder),
		recentPaths: filePaths(settings.recentPaths)
	};
}

export async function listDirectory(path: string, showHidden: boolean = false): Promise<DirectoryContents> {
	return invoke('list_directory', { path: filePath(path), showHidden });
}

export async function getFileInfo(path: string): Promise<FileEntry> {
	return invoke('get_file_info', { path: filePath(path) });
}

export async function createFile(path: string, name: string): Promise<FileEntry> {
	return invoke('create_file', { path: filePath(path), name });
}

export async function createDirectory(path: string, name: string): Promise<FileEntry> {
	return invoke('create_directory', { path: filePath(path), name });
}

export async function renameItem(path: string, newName: string): Promise<FileEntry> {
	return invoke('rename_item', { path: filePath(path), newName });
}

export async function copyItems(sources: string[], destination: string): Promise<string[]> {
	return invoke('copy_items', { sources: filePaths(sources), destination: filePath(destination) });
}

export async function moveItems(sources: string[], destination: string): Promise<string[]> {
	return invoke('move_items', { sources: filePaths(sources), destination: filePath(destination) });
}

export async function deleteItems(paths: string[]): Promise<void> {
	return invoke('delete_items', { paths: filePaths(paths) });
}

export async function getHomeDir(): Promise<string> {
	return invoke('get_home_dir');
}

export async function getUserDirs(): Promise<UserDirs> {
	return invoke('get_user_dirs');
}

export async function readTextFile(path: string, maxBytes?: number): Promise<string> {
	return invoke('read_text_file', { path: filePath(path), maxBytes });
}

export async function openWithDefault(path: string): Promise<void> {
	return invoke('open_with_default', { path: filePath(path) });
}

export async function getThumbnail(path: string): Promise<string | null> {
	return invoke('get_thumbnail', { path: filePath(path) });
}

// Drives
export async function listDrives(): Promise<DriveList> {
	return invoke('list_drives');
}

export async function getDriveInfo(mountPoint: string): Promise<DriveInfo> {
	return invoke('get_drive_info', { mountPoint: filePath(mountPoint) });
}

// Trash
export async function listTrash(): Promise<TrashContents> {
	return invoke('list_trash');
}

export async function moveToTrash(paths: string[]): Promise<void> {
	return invoke('move_to_trash', { paths: filePaths(paths) });
}

export async function restoreFromTrash(ids: string[]): Promise<void> {
	return invoke('restore_from_trash', { ids });
}

export async function deletePermanently(ids: string[]): Promise<void> {
	return invoke('delete_permanently', { ids });
}

export async function emptyTrash(trashPath?: string): Promise<void> {
	return invoke('empty_trash', { trashPath: trashPath ? filePath(trashPath) : null });
}

// Operations queue
export async function getQueueStatus(): Promise<QueueStatus> {
	return invoke('get_queue_status');
}

export async function cancelOperation(id: string): Promise<void> {
	return invoke('cancel_operation', { id });
}

export async function pauseOperation(id: string): Promise<void> {
	return invoke('pause_operation', { id });
}

export async function resumeOperation(id: string): Promise<void> {
	return invoke('resume_operation', { id });
}

// Settings
export async function getSettings(): Promise<Settings> {
	return appSettings(await invoke<Settings>('get_settings'));
}

export async function updateSettings(newSettings: Settings): Promise<void> {
	return invoke('update_settings', { newSettings: appSettings(newSettings) });
}

export async function addFavorite(item: FavoriteItem): Promise<void> {
	return invoke('add_favorite', { item: favoriteItem(item) });
}

export async function removeFavorite(path: string): Promise<void> {
	return invoke('remove_favorite', { path: filePath(path) });
}

export async function addPinnedFolder(folder: PinnedFolder): Promise<void> {
	return invoke('add_pinned_folder', { folder: pinnedFolder(folder) });
}

export async function removePinnedFolder(path: string): Promise<void> {
	return invoke('remove_pinned_folder', { path: filePath(path) });
}

export async function getBackgroundEffectStatus(): Promise<BackgroundEffectStatus> {
	return invoke('get_background_effect_status');
}

export async function getChooserConfig(): Promise<ChooserConfig> {
	return invoke('get_chooser_config');
}

export async function acceptChooser(paths: string[]): Promise<void> {
	return invoke('accept_chooser', { paths: filePaths(paths) });
}

export async function cancelChooser(): Promise<void> {
	return invoke('cancel_chooser');
}
