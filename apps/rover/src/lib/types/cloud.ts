export type CloudProvider = 'onedrive' | 'dropbox' | 'icloud' | 'nextcloud' | 'webdav';

export type FileState = 'online' | 'local' | 'syncing';

export interface CloudConflict {
	path: string;
	copy: string;
	copyFrom: 'thisDevice' | 'cloud';
	at: number;
}

export interface CloudDrive {
	account: string;
	provider: CloudProvider;
	name: string;
	path: string;
	state: 'connecting' | 'ready' | 'offline' | 'signInAgain' | 'problem';
	problem: string | null;
	paused: 'metered' | 'battery' | null;
	syncing: number;
	usage: { used: number; total: number } | null;
	kept: string[];
	conflicts: CloudConflict[];
	shareLinks: boolean;
	web: boolean;
}
