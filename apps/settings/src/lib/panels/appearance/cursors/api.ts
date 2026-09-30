import { invoke, listen } from '$lib/bridge';

export interface CursorTheme {
	name: string;
	title: string;
	path: string;
	removable: boolean;
}

export interface StoreFile {
	index: number;
	name: string;
	size: number;
}

export interface StoreItem {
	id: number;
	name: string;
	author: string;
	rating: number;
	downloads: number;
	preview: string | null;
	files: StoreFile[];
}

export interface StorePage {
	items: StoreItem[];
	pages: number;
}

export type Order = 'popular' | 'rating' | 'newest';

export type InstallState =
	| { state: 'downloading'; received: number; total: number | null }
	| { state: 'installing' }
	| { state: 'installed'; themes: string[] }
	| { state: 'failed'; error: string };

export const cursorThemes = () => invoke<CursorTheme[]>('appearance_cursor_themes');
export const cursorPreview = (path: string) => invoke<string>('appearance_cursor_preview', { path });
export const removeCursorTheme = (name: string) => invoke<void>('appearance_cursor_remove', { name });
export const openCursorFolder = () => invoke<void>('appearance_cursor_open_folder');
export const browseCursors = (search: string, order: Order, page: number) => invoke<StorePage>('appearance_cursor_store', { search, order, page });
export const installCursor = (id: number, file: number) => invoke<void>('appearance_cursor_install', { id, file });
export const openStorePage = (id: number) => invoke<void>('appearance_cursor_open_page', { id });
export const onInstallProgress = (callback: (progress: InstallState & { id: number }) => void) =>
	listen<InstallState & { id: number }>('appearance.cursorInstall', callback);
