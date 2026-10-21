import { activationToken } from '@luft/ui';
import { invoke, listen } from '#lib/bridge/index.js';

export type Schedule = 'daily' | 'weekly' | 'never';
export type Variant = 'standard' | 'nvidia';
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
	running: 'check' | 'download' | 'firmware' | 'rollback' | 'switch' | 'elsewhere' | null;
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

export interface PackageOverview {
	kind: 'packages';
	updates: Update[];
	prepared: boolean;
	results: Results | null;
}

export interface Release {
	version: string | null;
	notes: string | null;
	released: number | null;
}

export interface VariantOffer {
	to: Variant;
	size: number | null;
}

export interface ImageOverview {
	kind: 'image';
	current: Release;
	staged: Release | null;
	previous: Release | null;
	returning: Release | null;
	switching: Variant | null;
	available: (Release & { size: number }) | null;
	offer: VariantOffer | null;
}

export interface Overview {
	checked: number | null;
	apps: number | null;
	system: PackageOverview | ImageOverview;
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
export const rollback = () => invoke<void>('updates_rollback');
export const switchVariant = (variant: Variant) => invoke<void>('updates_switch', { variant });
export const restart = () => invoke<void>('updates_restart');
export const preferences = () => invoke<Preferences>('updates_preferences');
export const setPreferences = (preferences: Preferences) => invoke<void>('updates_set_preferences', { ...preferences });
export const openApps = async () => invoke<void>('updates_open_apps', { token: await activationToken() });
export const onActivity = (callback: (activity: Activity) => void) => listen<Activity>('updates.activity', callback);
export const onOverview = (callback: (overview: Overview) => void) => listen<Overview>('updates.overview', callback);
