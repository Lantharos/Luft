import type { FileEntry } from '#lib/bindings.js';

export interface InlineDraft {
	mode: 'create' | 'rename';
	itemType: 'file' | 'folder';
	targetPath: string | null;
	value: string;
	originalName: string | null;
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
export interface ClipboardState {
	items: FileEntry[];
	operation: 'copy' | 'cut' | null;
}
