import { invoke, listen } from '@lantharos/sabine';
import type {
	ArchiveFormat,
	HistoryState,
	Measurement,
	Ownership,
	Renaming,
	Resolution,
	SearchQuery,
	SearchUpdate,
	CountBatch,
	ThumbnailBatch,
	ThumbnailSize
} from './types';

export const historyState = () => invoke<HistoryState>('history_state');
export const undo = () => invoke<void>('undo');
export const redo = () => invoke<void>('redo');

export const resolveConflict = (id: string, resolution: Resolution, applyToAll: boolean) =>
	invoke<void>('resolve_conflict', { id, resolution, applyToAll });

export const duplicateItems = (paths: string[]) => invoke<string>('duplicate_items', { paths });
export const batchRename = (renamings: Renaming[]) => invoke<void>('batch_rename', { renamings });
export const compressItems = (paths: string[], destination: string, name: string, format: ArchiveFormat) =>
	invoke<string>('compress_items', { paths, destination, name, format });
export const extractArchives = (paths: string[], destination: string) => invoke<string>('extract_archives', { paths, destination });

export const countItems = (paths: string[], showHidden: boolean) => invoke<void>('count_items', { paths, showHidden });
export const requestThumbnails = (paths: string[], size: ThumbnailSize) => invoke<void>('request_thumbnails', { paths, size });

export const startSearch = (query: SearchQuery) => invoke<number>('start_search', { query });
export const cancelSearch = (id: number) => invoke<void>('cancel_search', { id });

export const openTerminal = (path: string) => invoke<void>('open_terminal', { path });

export const fileOwnership = (path: string) => invoke<Ownership>('file_ownership', { path });
export const setPermissions = (path: string, mode: number) => invoke<void>('set_permissions', { path, mode });
export const setDefaultApp = (path: string, app: string) => invoke<void>('set_default_app', { path, app });
export const measure = (paths: string[]) => invoke<number>('measure', { paths });
export const cancelMeasure = (id: number) => invoke<void>('cancel_measure', { id });

export const events = {
	history: (callback: (state: HistoryState) => void) => listen('rover.history', callback),
	thumbnails: (callback: (batch: ThumbnailBatch) => void) => listen('rover.thumbnails', callback),
	counts: (callback: (batch: CountBatch) => void) => listen('rover.counts', callback),
	search: (callback: (update: SearchUpdate) => void) => listen('rover.search', callback),
	measure: (callback: (measurement: Measurement) => void) => listen('rover.measure', callback)
};
