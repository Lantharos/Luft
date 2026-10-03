import type { Appearance } from '@luft/ui';
import type { Conflict } from '$lib/features/types';

export interface FileEntry {
	name: string;
	path: string;
	is_dir: boolean;
	is_file: boolean;
	is_hidden: boolean;
	size: number;
	modified: number | null;
	mime_type: string | null;
	extension: string | null;
}

export interface InlineDraft {
	mode: 'create' | 'rename';
	itemType: 'file' | 'folder';
	targetPath: string | null;
	value: string;
	originalName: string | null;
}

export interface DirectoryContents {
	path: string;
	entries: FileEntry[];
}

export interface UserDirs {
	home: string;
	documents: string | null;
	downloads: string | null;
	pictures: string | null;
	videos: string | null;
	music: string | null;
	desktop: string | null;
}

export interface DriveInfo {
	name: string;
	mount_point: string;
	total_space: number;
	available_space: number;
	used_space: number;
	is_removable: boolean;
}

export interface TrashLocation {
	name: string;
	path: string;
}

export interface TrashItem {
	id: string;
	name: string;
	original_path: string;
	trash_path: string;
	deleted_at: number;
	size: number;
	is_dir: boolean;
}

export interface TrashContents {
	items: TrashItem[];
	locations: TrashLocation[];
}

export type OperationType = 'Copy' | 'Move' | 'Delete' | 'Trash' | 'Compress' | 'Extract';
export type OperationStatus = 'InProgress' | 'Paused' | 'Completed' | 'Failed' | 'Cancelled';
export type OperationPhase =
	| 'Preparing'
	| 'Copying'
	| 'Moving'
	| 'Deleting'
	| 'Compressing'
	| 'Extracting'
	| 'Finalizing'
	| 'Completed'
	| 'SafeToEject';

export interface Operation {
	id: string;
	op_type: OperationType;
	status: OperationStatus;
	phase: OperationPhase;
	destination_label: string | null;
	destination_is_removable: boolean;
	progress: number;
	current_file: string | null;
	bytes_processed: number;
	total_bytes: number;
	items_processed: number;
	total_items: number;
	conflict: Conflict | null;
	error: string | null;
	started_at: number;
	completed_at: number | null;
}

export type ChooserMode = 'open' | 'save' | 'save_files';

export interface ChooserConfig {
	mode: ChooserMode;
	title: string;
	accept_label: string;
	directory: boolean;
	multiple: boolean;
	current_folder: string | null;
	current_name: string | null;
	files: string[];
}

export interface PinnedFolder {
	name: string;
	path: string;
	is_dir: boolean;
	icon: string | null;
}

export type ListColumnId = 'date' | 'size' | 'kind';
export type GroupBy = 'none' | 'kind' | 'date';

export interface ListColumn {
	id: ListColumnId;
	width: number;
	visible: boolean;
}

export interface Settings {
	folderViewModes: Record<string, ViewMode>;
	sortBy: SortBy;
	sortAsc: boolean;
	showHidden: boolean;
	pinnedFolders: PinnedFolder[];
	gridSize: number;
	detailsOpen: boolean;
	listColumns: ListColumn[];
	groupBy: GroupBy;
	hiddenPlaces: string[];
	networkPlaces: NetworkPlace[];
	recentServers: string[];
}

export interface NetworkPlace {
	name: string;
	uri: string;
}

export interface NetworkLocation extends NetworkPlace {
	path: string;
	device: boolean;
}

export type NetworkAsk =
	| {
			kind: 'password';
			id: number;
			message: string;
			user: string;
			domain: string;
			needsUser: boolean;
			needsDomain: boolean;
			needsPassword: boolean;
			anonymous: boolean;
			saving: boolean;
	  }
	| { kind: 'question'; id: number; message: string; choices: string[] }
	| { kind: 'done'; id: number };

export interface NetworkAnswer {
	id: number;
	cancelled: boolean;
	user?: string;
	domain?: string;
	password?: string;
	anonymous: boolean;
	remember: boolean;
	choice?: number;
}

export interface AppState extends Appearance {
	chooser: ChooserConfig | null;
	launchPaths: string[];
	canManageDrives: boolean;
	settings: Settings;
	userDirs: UserDirs | null;
}

export interface ViewMemory {
	scroll: number;
	selection: string[];
	cursor: string | null;
}

export interface TabPlace {
	path: string;
	title: string;
	view: SidebarView;
}

export interface TabHistoryEntry extends TabPlace {
	memory?: ViewMemory;
}

export interface Arrival {
	from: string;
	memory: ViewMemory | null;
}

export interface Tab extends TabPlace {
	id: string;
	history: TabHistoryEntry[];
	historyIndex: number;
}

export type SidebarView = 'home' | 'recent' | 'trash';
export type ViewMode = 'list' | 'grid' | 'columns';
export type SortBy = 'name' | 'size' | 'date' | 'type';

export interface ClipboardState {
	items: FileEntry[];
	operation: 'copy' | 'cut' | null;
}
