import { invoke, listen } from '@lantharos/sabine';
import type { AppState, DirectoryContents, DriveInfo, FileEntry, Operation, Settings, TrashContents } from './types';
import type { VcsRoot, VcsStatusEvent } from './vcs/types';

export const appState = () => invoke<AppState>('app_state');
export const updateSettings = (settings: Settings) => invoke<void>('update_settings', { settings });

export const listDirectory = (path: string, showHidden: boolean) => invoke<DirectoryContents>('list_directory', { path, showHidden });
export const watchDirectory = (path: string) => invoke<void>('watch_directory', { path });
export const getFileInfo = (path: string) => invoke<FileEntry>('get_file_info', { path });
export const createFile = (path: string, name: string) => invoke<FileEntry>('create_file', { path, name });
export const createDirectory = (path: string, name: string) => invoke<FileEntry>('create_directory', { path, name });
export const renameItem = (path: string, newName: string) => invoke<FileEntry>('rename_item', { path, newName });
export const copyItems = (sources: string[], destination: string) => invoke<string>('copy_items', { sources, destination });
export const moveItems = (sources: string[], destination: string) => invoke<string>('move_items', { sources, destination });
export const openWithDefault = (path: string) => invoke<void>('open_with_default', { path });

export const listDrives = () => invoke<DriveInfo[]>('list_drives');
export const ejectDrive = (mountPoint: string) => invoke<void>('eject_drive', { mountPoint });

export const listTrash = () => invoke<TrashContents>('list_trash');
export const moveToTrash = (paths: string[]) => invoke<void>('move_to_trash', { paths });
export const restoreFromTrash = (ids: string[]) => invoke<void>('restore_from_trash', { ids });
export const deletePermanently = (ids: string[]) => invoke<void>('delete_permanently', { ids });
export const emptyTrash = (trashPath: string | null) => invoke<void>('empty_trash', { trashPath });

export const listOperations = () => invoke<Operation[]>('list_operations');
export const cancelOperation = (id: string) => invoke<void>('cancel_operation', { id });
export const pauseOperation = (id: string) => invoke<void>('pause_operation', { id });
export const resumeOperation = (id: string) => invoke<void>('resume_operation', { id });

export const vcsRoot = (path: string) => invoke<VcsRoot | null>('vcs_root', { path });
export const startVcsStatus = (root: string) => invoke<string>('vcs_status', { root });
export const vcsDiff = (root: string, filePath: string | null) => invoke<string>('vcs_diff', { root, filePath });
export const saveVcs = (root: string, message: string, files: string[] | null) => invoke<void>('vcs_save', { root, message, files });
export const syncVcs = (root: string) => invoke<void>('vcs_sync', { root });

export const resolveArguments = (activation: SingleInstanceActivation) => invoke<string[]>('resolve_arguments', activation);

export const acceptChooser = (paths: string[]) => invoke<void>('accept_chooser', { paths });
export const cancelChooser = () => invoke<void>('cancel_chooser');

export type SingleInstanceActivation = {
	arguments: string[];
	workingDirectory: string | null;
};

export const events = {
	operations: (callback: (operations: Operation[]) => void) => listen('rover.operations', callback),
	drives: (callback: () => void) => listen('rover.drives', callback),
	directory: (callback: (event: { path: string }) => void) => listen('rover.directory', callback),
	vcsStatus: (callback: (event: VcsStatusEvent) => void) => listen('rover.vcs', callback),
	activation: (callback: (activation: SingleInstanceActivation) => void) => listen('singleInstance.activate', callback)
};
