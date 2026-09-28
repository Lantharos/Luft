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

export type OperationType = 'Copy' | 'Move' | 'Delete' | 'Trash';
export type OperationStatus = 'InProgress' | 'Paused' | 'Completed' | 'Failed' | 'Cancelled';
export type OperationPhase = 'Preparing' | 'Copying' | 'Moving' | 'Deleting' | 'Finalizing' | 'Completed' | 'SafeToEject';

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

export interface FavoriteItem {
	name: string;
	path: string;
	is_dir: boolean;
}

export interface Settings {
	folderViewModes: Record<string, ViewMode>;
	sortBy: SortBy;
	sortAsc: boolean;
	showHidden: boolean;
	favorites: FavoriteItem[];
	pinnedFolders: PinnedFolder[];
}

export interface AppState {
	chooser: ChooserConfig | null;
	launchPaths: string[];
	settings: Settings;
	userDirs: UserDirs | null;
	translucent: boolean;
}

export interface TabHistoryEntry {
	path: string;
	title: string;
	view: SidebarView;
}

export interface Tab extends TabHistoryEntry {
	id: string;
	history: TabHistoryEntry[];
	historyIndex: number;
}

export type SidebarView = 'home' | 'favorites' | 'drives' | 'trash';
export type ViewMode = 'list' | 'grid' | 'columns';
export type SortBy = 'name' | 'size' | 'date' | 'type';

export interface ClipboardState {
	items: FileEntry[];
	operation: 'copy' | 'cut' | null;
}
