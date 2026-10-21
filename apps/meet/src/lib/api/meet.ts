import { invoke, listen } from '@lantharos/sabine';
import type { Locale } from '@luft/i18n';

export type Level = 'fine' | 'note' | 'blocks';
export type Stage = 'shrinking' | 'erasing' | 'partitioning' | 'downloading' | 'packing' | 'removing' | 'writing' | 'copying' | 'verifying';
export type Intent = 'try' | 'install' | 'replace';
export type Platform = 'windows' | 'linux';
export type Layout = 'subvolumes' | 'separateHome' | 'single' | 'encrypted' | 'unknown';
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
	drive: string | null;
}

export type PlaceKind = 'windows' | 'free' | 'whole';

export interface Contents {
	label: string | null;
	letter: string | null;
	filesystem: string | null;
	size: number;
	bitlocker: boolean;
}

export interface Place {
	id: string;
	kind: PlaceKind;
	drive: { name: string; size: number; windows: boolean };
	free: number;
	smallest: number;
	most: number;
	contents: Contents[];
}

export interface WindowsFacts {
	platform: 'windows';
	windowsSize: number;
	windowsUsed: number;
	espSize: number;
	fastStartup: boolean;
	universalClock: boolean;
	bluetooth: number;
	places: Place[];
}

export interface LinuxFacts {
	platform: 'linux';
	system: string;
	layout: Layout;
}

export interface Report {
	facts: WindowsFacts | LinuxFacts;
	findings: Finding[];
	live: number;
	download: number;
	prepared: Prepared | null;
	outdated: boolean;
}

export type Blocked = 'busy' | 'encrypted' | 'elsewhere' | 'apart' | 'unreadable';
export type Change = { change: 'grow' } | { change: 'shrink'; bytes: number };

export interface Range {
	smallest: number;
	most: number;
	leastGrow: number;
	leastShrink: number;
}

export interface Installed {
	drive: string;
	besideWindows: boolean;
	size: number;
	allocated: number | null;
	encrypted: boolean;
	windowsSize: number;
	windowsUsed: number;
	blocked: Blocked | null;
	pending: Change | null;
	windowsFree: number;
	leftovers: boolean;
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

export interface Belongings {
	folders: FoundFolder[];
	wallpaper: string | null;
	account: Account;
}

export interface Packing {
	folders: { kind: FolderKind; path: string }[];
	wallpaper: string | null;
	account: Account | null;
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

export async function start<T>(command: string, request: unknown = {}): Promise<T> {
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

export const call = <T>(request: object) => start<T>('meet_call', request);

export const check = (source: Source) => call<Report>({ call: 'check', source });
export const prepare = (luft: number, source: Source, place: string) => call<Prepared>({ call: 'prepare', luft, source, place });
export const refresh = (source: Source) => call<Prepared>({ call: 'refresh', source });
export const pack = (belongings: Packing) => call<Prepared>({ call: 'pack', belongings });
export const restart = (intent: Intent, windows: WindowsChoices) => call<null>({ call: 'restart', intent, windows });
export const tidy = () => call<null>({ call: 'tidy' });
export const firmwareSettings = () => call<null>({ call: 'firmwareSettings' });
export const undo = () => call<null>({ call: 'undo' });
export const luft = () => call<Installed | null>({ call: 'luft' });
export const luftRange = () => call<Range | null>({ call: 'luftRange' });
export const resizeLuft = (size: number) => call<Installed>({ call: 'resizeLuft', size });
export const cancelResize = () => call<Installed>({ call: 'cancelResize' });
export const giveWindows = () => call<Installed>({ call: 'giveWindows' });
export const startLuft = () => call<null>({ call: 'startLuft' });
export const removeLuft = () => call<null>({ call: 'removeLuft' });
export const installed = () => start<boolean>('meet_installed');
export const pickIso = () => start<string | null>('meet_pick_iso');
export const saveLogs = () => start<string | null>('meet_save_logs');
export const showFile = (path: string) => start<null>('meet_show_file', path);
export const belongings = () => start<Belongings>('meet_belongings');
export const defaultSource = () => invoke<Source>('meet_source', {});
export const platform = () => invoke<Platform>('meet_platform', {});
export const locale = () => invoke<Locale>('meet_locale', {});
export const onProgress = (callback: (progress: Progress) => void) => listen<Progress>('meet.progress', callback);
