import type { FileEntry } from '$lib/types';

export type Resolution = 'replace' | 'merge' | 'skip' | 'keepBoth';

export interface ConflictItem {
	path: string;
	name: string;
	is_dir: boolean;
	size: number;
	modified: number | null;
}

export interface Conflict {
	source: ConflictItem;
	target: ConflictItem;
}

export type NoticeKind = 'done' | 'undone' | 'redone' | 'failed';

export interface HistoryState {
	canUndo: boolean;
	canRedo: boolean;
	notice: { kind: NoticeKind; message: string } | null;
}

export type ThumbnailSize = 'normal' | 'large' | 'x-large' | 'xx-large';

export interface ThumbnailBatch {
	items: { path: string; thumbnail: string | null; modified: number }[];
}

export type SearchKind = 'folder' | 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code';

export interface SearchQuery {
	root: string;
	text: string;
	contents: boolean;
	kinds: SearchKind[];
	modifiedAfter: number | null;
	minSize: number | null;
	maxSize: number | null;
	showHidden: boolean;
}

export interface SearchResult extends FileEntry {
	snippet: string | null;
}

export interface SearchUpdate {
	id: number;
	results: SearchResult[];
	done: boolean;
	truncated: boolean;
	elapsedMs: number;
}

export type ArchiveFormat = 'zip' | 'tar-zst';

export interface Ownership {
	owner: string;
	group: string;
	mode: number;
	editable: boolean;
}

export interface Measurement {
	id: number;
	bytes: number;
	files: number;
	folders: number;
	done: boolean;
}

export interface Renaming {
	path: string;
	name: string;
}

export interface CountBatch {
	items: { path: string; count: number | null }[];
}
