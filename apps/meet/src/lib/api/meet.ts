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

export type Failure = 'declined' | 'stopped';

export class Failed extends Error {
	constructor(
		readonly failure: Failure,
		detail: string
	) {
		super(detail);
	}
}

type Finished = { job: number; value: unknown } | { job: number; failure: Failure; detail: string };

interface Waiting {
	resolve: (value: unknown) => void;
	reject: (error: Failed) => void;
}

const waiting = new Map<number, Waiting>();
let nextJob = 1;
let listening = false;

function settle(finished: Finished) {
	const job = waiting.get(finished.job);
	if (!job) return;
	waiting.delete(finished.job);
	if ('failure' in finished) job.reject(new Failed(finished.failure, finished.detail));
	else job.resolve(finished.value);
}

async function start<T>(command: string, request: unknown = {}): Promise<T> {
	if (!listening) {
		listen<Finished>('meet.finished', settle);
		listening = true;
	}
	const job = nextJob++;
	const finished = new Promise<T>((resolve, reject) => waiting.set(job, { resolve: resolve as (value: unknown) => void, reject }));
	try {
		await invoke(command, { job, request });
	} catch (error) {
		waiting.delete(job);
		throw error;
	}
	return finished;
}

const call = <T>(request: object) => start<T>('meet_call', request);

export const check = (source: Source) => call<Report>({ call: 'check', source });
export const prepare = (luft: number, source: Source) => call<Prepared>({ call: 'prepare', luft, source });
export const pack = (belongings: Packing) => call<Prepared>({ call: 'pack', belongings });
export const restart = (intent: Intent, windows: WindowsChoices) => call<null>({ call: 'restart', intent, windows });
export const tidy = () => call<null>({ call: 'tidy' });
export const firmwareSettings = () => call<null>({ call: 'firmwareSettings' });
export const undo = () => call<null>({ call: 'undo' });
export const pickIso = () => start<string | null>('meet_pick_iso');
export const saveLogs = () => start<string | null>('meet_save_logs');
export const showFile = (path: string) => start<null>('meet_show_file', path);
export const belongings = () => start<Belongings>('meet_belongings');
export const defaultSource = () => invoke<Source>('meet_source', {});
export const onProgress = (callback: (progress: Progress) => void) => listen<Progress>('meet.progress', callback);
