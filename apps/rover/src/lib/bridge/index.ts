import { fileUrl, invoke, listen } from '@lantharos/sabine';
import { activationToken } from '@luft/ui';
import type {
	AppState,
	DirectoryContents,
	DriveInfo,
	FileEntry,
	NetworkAnswer,
	NetworkAsk,
	NetworkLocation,
	NetworkPlace,
	Operation,
	Settings,
	TrashContents,
	WindowsDrive
} from '../types/index';
import type { CloudDrive, FileState } from '../types/cloud';
import type { FileDetails, OpenWithApps } from '../types/details';
import type { VcsRoot, VcsStatusEvent } from '../vcs/types';

export const appState = () => invoke<AppState>('app_state');
export const updateSettings = (settings: Settings) => invoke<void>('update_settings', { settings });

export const listDirectory = (path: string, showHidden: boolean) => invoke<DirectoryContents>('list_directory', { path, showHidden });
export const watchDirectory = (path: string) => invoke<void>('watch_directory', { path });
export const listFolders = (path: string) => invoke<string[]>('list_folders', { path });
export const getFileInfo = (path: string) => invoke<FileEntry>('get_file_info', { path });
export const createFile = (path: string, name: string) => invoke<FileEntry>('create_file', { path, name });
export const createDirectory = (path: string, name: string) => invoke<FileEntry>('create_directory', { path, name });
export const renameItem = (path: string, newName: string) => invoke<FileEntry>('rename_item', { path, newName });
export const copyItems = (sources: string[], destination: string) => invoke<string>('copy_items', { sources, destination });
export const moveItems = (sources: string[], destination: string) => invoke<string>('move_items', { sources, destination });
export const openWithDefault = async (path: string) => invoke<void>('open_with_default', { path, token: await activationToken() });
export const openLink = async (uri: string) => invoke<void>('open_link', { uri, token: await activationToken() });
export const fileDetails = (path: string) => invoke<FileDetails>('file_details', { path });
export const appsForFile = (path: string) => invoke<OpenWithApps>('apps_for_file', { path });
export const openWithApp = async (path: string, app: string) => invoke<void>('open_with_app', { path, app, token: await activationToken() });

export const listDrives = () => invoke<DriveInfo[]>('list_drives');
export const ejectDrive = (mountPoint: string) => invoke<void>('eject_drive', { mountPoint });
export const listWindows = () => invoke<WindowsDrive[]>('list_windows');
export const openWindows = (device: string, readOnly: boolean) => invoke<string>('open_windows', { device, readOnly }, { timeoutMs: 300_000 });
export const manageDrive = async (mountPoint: string) => invoke<void>('manage_drive', { mountPoint, token: await activationToken() });

export const networkLocations = () => invoke<NetworkLocation[]>('network_locations');
export const connectNetwork = (uri: string) => invoke<NetworkLocation>('network_connect', { uri });
export const answerNetwork = (answer: NetworkAnswer) => invoke<void>('network_answer', { ...answer });
export const disconnectNetwork = (uri: string) => invoke<void>('network_disconnect', { uri });
export const discoverNetwork = () => invoke<NetworkPlace[]>('network_discover');

export const cloudDrives = () => invoke<CloudDrive[]>('cloud_drives');
export const cloudStates = (path: string) => invoke<Record<string, FileState>>('cloud_states', { path });
export const keepOnDevice = (paths: string[]) => invoke<void>('cloud_keep', { paths });
export const freeUpSpace = (paths: string[]) => invoke<void>('cloud_free', { paths }, { timeoutMs: 600_000 });
export const shareLink = (path: string) => invoke<string>('cloud_share_link', { path }, { timeoutMs: 60_000 });
export const openInBrowser = async (path: string) =>
	invoke<void>('cloud_open_in_browser', { path, token: await activationToken() }, { timeoutMs: 60_000 });
export const dismissConflict = (account: string, copy: string) => invoke<void>('cloud_dismiss_conflict', { account, copy });
export const addCloudAccount = async () => invoke<void>('cloud_add_account', { token: await activationToken() });

export const localFileSource = (path: string, modified: number | null) => `${fileUrl(path)}?v=${modified ?? 0}`;

export const recentFiles = () => invoke<FileEntry[]>('recent_files');
export const trashCount = () => invoke<number>('trash_count');

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
	network: (callback: () => void) => listen('rover.network', callback),
	cloud: (callback: () => void) => listen('rover.cloud', callback),
	networkAsk: (callback: (ask: NetworkAsk) => void) => listen('rover.network.ask', callback),
	directory: (callback: (event: { path: string }) => void) => listen('rover.directory', callback),
	vcsStatus: (callback: (event: VcsStatusEvent) => void) => listen('rover.vcs', callback),
	activation: (callback: (activation: SingleInstanceActivation) => void) => listen('singleInstance.activate', callback)
};
