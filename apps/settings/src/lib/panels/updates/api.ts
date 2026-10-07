import { invoke, listen } from '#lib/bridge.js';

export type Schedule = 'daily' | 'weekly' | 'never';
export type Stage = 'waiting' | 'preparing' | 'downloading' | 'installing' | 'removing' | 'finishing';

export interface PackageId {
	id: string;
	name: string;
	version: string;
	arch: string;
	data: string;
}

export interface Update {
	package: PackageId;
	summary: string;
	security: boolean;
	downloadSize: number;
	installedVersion: string | null;
}

export interface Progress {
	stage: Stage;
	fraction: number | null;
}

export type Change = 'refresh' | 'download' | 'update' | 'install' | 'remove';

export interface Elsewhere {
	by: string | null;
	change: Change | null;
}

export interface Activity {
	running: 'check' | 'download' | 'firmware' | 'elsewhere' | null;
	target: string | null;
	elsewhere: Elsewhere | null;
	progress: Progress | null;
	error: string | null;
}

export interface Preferences {
	schedule: Schedule;
	download: boolean;
}

export interface Results {
	success: boolean;
	packages: number;
	finished: number;
	error: string | null;
}

export interface Overview {
	checked: number | null;
	updates: Update[];
	prepared: boolean;
	results: Results | null;
	apps: number | null;
}

export interface Status {
	overview: Overview | null;
	activity: Activity;
}

export interface Firmware {
	id: string;
	name: string;
	vendor: string | null;
	current: string | null;
	version: string;
	summary: string | null;
	size: number;
	restart: boolean;
}

const SLOW = { timeoutMs: 600_000 };

export const status = () => invoke<Status>('updates_status');
export const load = () => invoke<void>('updates_load');
export const check = () => invoke<void>('updates_check');
export const download = () => invoke<void>('updates_download');
export const cancel = () => invoke<void>('updates_cancel');
export const firmware = () => invoke<Firmware[]>('updates_firmware', {}, SLOW);
export const installFirmware = (id: string) => invoke<void>('updates_firmware_install', { id });
export const restart = () => invoke<void>('updates_restart');
export const preferences = () => invoke<Preferences>('updates_preferences');
export const setPreferences = (preferences: Preferences) => invoke<void>('updates_set_preferences', { ...preferences });
export const openApps = () => invoke<void>('updates_open_apps');
export const onActivity = (callback: (activity: Activity) => void) => listen<Activity>('updates.activity', callback);
export const onOverview = (callback: (overview: Overview) => void) => listen<Overview>('updates.overview', callback);
