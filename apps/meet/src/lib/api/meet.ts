import { invoke, listen } from '@lantharos/sabine';

export type Level = 'fine' | 'note' | 'blocks';
export type Stage = 'shrinking' | 'partitioning' | 'downloading' | 'packing' | 'removing';
export type Intent = 'try' | 'install';
export type FolderKind = 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
export type Channel = 'latest' | 'nightly';
export type Source = { kind: 'download'; channel: Channel } | { kind: 'file'; path: string };

export type Action = 'firmwareSettings' | 'tidy' | 'chooseIso';

export interface Finding {
	topic: string;
	level: Level;
	title: string;
	detail: string;
	action: Action | null;
}

export interface Prepared {
	room: number;
	movingBox: number | null;
}

export interface Report {
	facts: {
		windowsSize: number;
		windowsUsed: number;
		espSize: number;
		fastStartup: boolean;
		universalClock: boolean;
		bluetooth: number;
	};
	findings: Finding[];
	live: number;
	smallestLuft: number;
	mostLuft: number;
	prepared: Prepared | null;
}

export interface Progress {
	stage: Stage;
	done: number;
	total: number;
}

export interface FoundFolder {
	kind: FolderKind;
	path: string;
	files: number;
	bytes: number;
}

export interface Account {
	fullName: string;
	userName: string;
	picture: string | null;
}

export interface Regional {
	timeZone: string | null;
	keyboard: string | null;
	locale: string | null;
}

export interface Belongings {
	folders: FoundFolder[];
	wallpaper: string | null;
	account: Account;
	regional: Regional;
}

export interface Packing {
	folders: { kind: FolderKind; path: string }[];
	wallpaper: string | null;
	account: Account | null;
	regional: Regional | null;
	wifi: boolean;
	bluetooth: boolean;
}

export interface WindowsChoices {
	fastStartupOff: boolean;
	universalClock: boolean;
}

export const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

const FOREVER = 24 * 60 * 60 * 1000;
const CHECKING = 5 * 60 * 1000;

export const check = (source: Source) => invoke<Report>('meet_check', { source }, { timeoutMs: CHECKING });
export const prepare = (luft: number, source: Source) => invoke<Prepared>('meet_prepare', { luft, source }, { timeoutMs: FOREVER });
export const pack = (belongings: Packing) => invoke<Prepared>('meet_pack', { belongings }, { timeoutMs: FOREVER });
export const restart = (intent: Intent, windows: WindowsChoices) => invoke<null>('meet_restart', { intent, windows }, { timeoutMs: CHECKING });
export const tidy = () => invoke<null>('meet_tidy', {}, { timeoutMs: CHECKING });
export const firmwareSettings = () => invoke<null>('meet_firmware_settings', {}, { timeoutMs: CHECKING });
export const undo = () => invoke<null>('meet_undo', {}, { timeoutMs: FOREVER });
export const pickIso = () => invoke<string | null>('meet_pick_iso', {}, { timeoutMs: FOREVER });
export const defaultSource = () => invoke<Source>('meet_source', {});
export const belongings = () => invoke<Belongings>('meet_belongings', {}, { timeoutMs: CHECKING });
export const onProgress = (callback: (progress: Progress) => void) => listen<Progress>('meet.progress', callback);
