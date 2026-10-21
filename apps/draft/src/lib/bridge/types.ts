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
