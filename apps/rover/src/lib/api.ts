import { invoke } from '@tauri-apps/api/core';
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

// File system operations
export async function listDirectory(path: string, showHidden: boolean = false): Promise<DirectoryContents> {
	return invoke('list_directory', { path, showHidden });
}

export async function getFileInfo(path: string): Promise<FileEntry> {
	return invoke('get_file_info', { path });
}

export async function createFile(path: string, name: string): Promise<FileEntry> {
	return invoke('create_file', { path, name });
}

export async function createDirectory(path: string, name: string): Promise<FileEntry> {
	return invoke('create_directory', { path, name });
}

export async function renameItem(path: string, newName: string): Promise<FileEntry> {
	return invoke('rename_item', { path, newName });
}

export async function copyItems(sources: string[], destination: string): Promise<string[]> {
	return invoke('copy_items', { sources, destination });
}

export async function moveItems(sources: string[], destination: string): Promise<string[]> {
	return invoke('move_items', { sources, destination });
}

export async function deleteItems(paths: string[]): Promise<void> {
	return invoke('delete_items', { paths });
}

export async function getHomeDir(): Promise<string> {
	return invoke('get_home_dir');
}

export async function getUserDirs(): Promise<UserDirs> {
	return invoke('get_user_dirs');
}

export async function readTextFile(path: string, maxBytes?: number): Promise<string> {
	return invoke('read_text_file', { path, maxBytes });
}

export async function openWithDefault(path: string): Promise<void> {
	return invoke('open_with_default', { path });
}

export async function getThumbnail(path: string): Promise<string | null> {
	return invoke('get_thumbnail', { path });
}

// Drives
export async function listDrives(): Promise<DriveList> {
	return invoke('list_drives');
}

export async function getDriveInfo(mountPoint: string): Promise<DriveInfo> {
	return invoke('get_drive_info', { mountPoint });
}

// Trash
export async function listTrash(): Promise<TrashContents> {
	return invoke('list_trash');
}

export async function moveToTrash(paths: string[]): Promise<void> {
	return invoke('move_to_trash', { paths });
}

export async function restoreFromTrash(ids: string[]): Promise<void> {
	return invoke('restore_from_trash', { ids });
}

export async function deletePermanently(ids: string[]): Promise<void> {
	return invoke('delete_permanently', { ids });
}

export async function emptyTrash(trashPath?: string): Promise<void> {
	return invoke('empty_trash', { trashPath: trashPath ?? null });
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
	return invoke('get_settings');
}

export async function updateSettings(newSettings: Settings): Promise<void> {
	return invoke('update_settings', { newSettings });
}

export async function addFavorite(item: FavoriteItem): Promise<void> {
	return invoke('add_favorite', { item });
}

export async function removeFavorite(path: string): Promise<void> {
	return invoke('remove_favorite', { path });
}

export async function addPinnedFolder(folder: PinnedFolder): Promise<void> {
	return invoke('add_pinned_folder', { folder });
}

export async function removePinnedFolder(path: string): Promise<void> {
	return invoke('remove_pinned_folder', { path });
}

export async function getBackgroundEffectStatus(): Promise<BackgroundEffectStatus> {
	return invoke('get_background_effect_status');
}

export async function getChooserConfig(): Promise<ChooserConfig> {
	return invoke('get_chooser_config');
}

export async function acceptChooser(paths: string[]): Promise<void> {
	return invoke('accept_chooser', { paths });
}

export async function cancelChooser(): Promise<void> {
	return invoke('cancel_chooser');
}
