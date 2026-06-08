// File system types
export interface FileEntry {
	name: string;
	path: string;
	is_dir: boolean;
	is_file: boolean;
	is_symlink: boolean;
	is_hidden: boolean;
	size: number;
	modified: number | null;
	created: number | null;
	accessed: number | null;
	mime_type: string | null;
	extension: string | null;
	permissions: number;
	uid: number;
	gid: number;
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
	total_items: number;
	total_size: number;
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

// Drive types
export interface DriveInfo {
	name: string;
	mount_point: string;
	device: string;
	fs_type: string;
	total_space: number;
	available_space: number;
	used_space: number;
	is_removable: boolean;
	is_readonly: boolean;
}

export interface DriveList {
	drives: DriveInfo[];
}

// Trash types
export interface TrashLocation {
	id: string;
	name: string;
	path: string;
}

export interface TrashItem {
	id: string;
	name: string;
	original_path: string;
	trash_path: string;
	trash_name: string;
	deleted_at: number;
	size: number;
	is_dir: boolean;
}

export interface TrashContents {
	items: TrashItem[];
	total_items: number;
	total_size: number;
	locations: TrashLocation[];
}

// Operations queue types
export type OperationType = 'Copy' | 'Move' | 'Delete' | 'Trash';
export type OperationStatus = 'Pending' | 'InProgress' | 'Paused' | 'Completed' | 'Failed' | 'Cancelled';

export interface Operation {
	id: string;
	op_type: OperationType;
	status: OperationStatus;
	sources: string[];
	destination: string | null;
	progress: number;
	current_file: string | null;
	bytes_processed: number;
	total_bytes: number;
	items_processed: number;
	total_items: number;
	error: string | null;
	started_at: number | null;
	completed_at: number | null;
}

export interface QueueStatus {
	operations: Operation[];
	active_count: number;
	pending_count: number;
}

export type BackgroundEffect = 'translucent' | 'opaque';

export interface BackgroundEffectStatus {
	background_effect: BackgroundEffect;
	background_effect_reason: string;
}

export type ChooserMode = 'open' | 'save' | 'save_files';

export interface ChooserConfig {
	active: boolean;
	mode: ChooserMode;
	title: string;
	accept_label: string;
	directory: boolean;
	multiple: boolean;
	current_folder: string | null;
	current_name: string | null;
	files: string[];
}

// Settings types
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
	viewMode: 'list' | 'grid' | 'columns';
	folderViewModes: Record<string, ViewMode>;
	sortBy: 'name' | 'size' | 'date' | 'type';
	sortAsc: boolean;
	showHidden: boolean;
	previewPanel: boolean;
	confirmDelete: boolean;
	confirmTrash: boolean;
	singleClickOpen: boolean;
	sidebarWidth: number;
	iconSize: number;
	favorites: FavoriteItem[];
	pinnedFolders: PinnedFolder[];
	sidebarBookmarksInitialized: boolean;
	recentPaths: string[];
}

// Tab types
export interface Tab {
	id: string;
	path: string;
	title: string;
	view: SidebarView;
	history: string[];
	historyIndex: number;
}

// View types
export type SidebarView = 'home' | 'favorites' | 'drives' | 'trash';
export type ViewMode = 'list' | 'grid' | 'columns';
export type SortBy = 'name' | 'size' | 'date' | 'type';

// Clipboard
export interface ClipboardState {
	items: FileEntry[];
	operation: 'copy' | 'cut' | null;
}
