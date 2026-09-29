import type { Appearance } from '@luft/ui';

export interface AppState extends Appearance {
	home: string;
	backups: string;
	folders: string[];
}

export interface Entry {
	name: string;
	path: string;
	folder: boolean;
}

export interface FileIndex {
	files: string[];
	truncated: boolean;
}

export interface Stat {
	size: number;
	modified: number;
}

export interface Activation {
	arguments: string[];
	workingDirectory: string | null;
}

export type StoreName = 'settings' | 'session' | 'files';

export interface SaveTarget {
	path: string;
	encoding: string;
	bom: boolean;
}

export interface Backend {
	appState(): Promise<AppState>;
	activationFolders(activation: Activation): Promise<string[]>;
	readStore<T>(name: StoreName): Promise<T | null>;
	writeStore(name: StoreName, value: unknown): Promise<void>;
	removeBackup(name: string): Promise<void>;
	list(path: string): Promise<Entry[]>;
	index(root: string): Promise<FileIndex>;
	stat(path: string): Promise<Stat | null>;
	detectEncoding(path: string): Promise<string>;
	read(path: string): Promise<Uint8Array>;
	write(chunks: Iterable<string>, target: SaveTarget): Promise<Stat>;
	watch(folders: string[]): Promise<void>;
	chooseFiles(folder: string | null): Promise<string[]>;
	chooseFolder(folder: string | null): Promise<string | null>;
	chooseSave(name: string, folder: string | null): Promise<string | null>;
	showInFolder(path: string): Promise<void>;
	openLink(uri: string): Promise<void>;
	takeOpenedFiles(): Promise<string[]>;
	onFilesOpened(callback: () => void): () => void;
	onFilesChanged(callback: (paths: string[]) => void): () => void;
	onFilesDropped(callback: (paths: string[]) => void): () => void;
	onActivation(callback: (activation: Activation) => void): () => void;
}
