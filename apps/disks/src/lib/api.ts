import { invoke, listen } from '@lantharos/sabine';
import type { Appearance } from '@luft/ui';

export type Kind = 'nvme' | 'ssd' | 'hdd' | 'usb' | 'card' | 'optical' | 'image';
export type Filesystem = 'ext4' | 'btrfs' | 'exfat' | 'ntfs' | 'vfat';

export interface Job {
	operation: string;
	progress: number | null;
}

export interface Volume {
	block: string;
	device: string;
	number: number | null;
	offset: number;
	size: number;
	label: string;
	usage: string;
	fsType: string;
	uuid: string;
	mountPoints: string[];
	used: number | null;
	swapActive: boolean;
	system: boolean;
	partitionType: string | null;
	encryption: { kind: string; cleartext: Volume | null } | null;
	startup: { directory: string; options: string } | null;
	job: Job | null;
}

export type Segment = ({ kind: 'volume' } & Volume) | { kind: 'free'; offset: number; size: number };

export interface Health {
	state: 'good' | 'warning' | 'failing';
	temperature: number | null;
	powerOnHours: number | null;
	badSectors: number;
	warnings: string[];
	selftest: { status: string; remaining: number | null };
}

export interface Drive {
	id: string;
	block: string;
	device: string;
	name: string;
	model: string;
	serial: string;
	size: number;
	kind: Kind;
	removable: boolean;
	canPowerOff: boolean;
	system: boolean;
	readOnly: boolean;
	table: 'gpt' | 'dos' | null;
	segments: Segment[];
	health: Health | null;
	job: Job | null;
}

export interface Support {
	filesystem: Filesystem;
	available: boolean;
	missing: string;
	resize: number;
}

export interface Format {
	filesystem: Filesystem;
	label: string;
	passphrase: string | null;
	remember: boolean;
	erase: boolean;
}

export interface Target {
	drive: string;
	block: string | null;
}

export interface ImageProgress {
	block: string;
	restoring: boolean;
	copied: number;
	total: number;
	rate: number;
	finished: boolean;
	error: string | null;
}

export interface ChosenImage {
	path: string;
	name: string;
	size: number;
}

export type SpaceItem =
	| { kind: 'dir'; name: string; size: number; items: number; done: boolean; inner: number[] }
	| { kind: 'file'; name: string; size: number }
	| { kind: 'other'; count: number; size: number };

export interface SpaceView {
	path: string[];
	size: number;
	items: number;
	done: boolean;
	children: SpaceItem[];
	hiddenCount: number;
	hiddenSize: number;
}

export interface SpaceUpdate {
	scan: number;
	root: string;
	view: SpaceView | null;
	scanning: boolean;
	totalItems: number;
	totalSize: number;
	unreadable: number;
	seconds: number;
}

export interface AppState extends Appearance {
	arguments: string[];
}

export interface DriveEncryption {
	state: 'encrypting' | 'decrypting' | 'paused' | 'waiting' | 'on';
	change: '' | 'encrypt' | 'decrypt';
	progress: number;
	remaining: number;
	autoUnlock: boolean;
	recoveryKeyStored: boolean;
}

export interface Protection {
	available: boolean;
	autoUnlock: string;
	drives: Record<string, DriveEncryption>;
}

export interface EncryptionCheck {
	method: 'in-place' | 'reformat' | 'none';
	checks: { id: string; passed: boolean; sentence: string }[];
	autoUnlock: string;
}

export type Outcome<T> = { done: T } | { wrongKey: string };

export const CANCELLED = 'cancelled';
const WAIT = { timeoutMs: 2_147_483_647 };

export const appState = () => invoke<AppState>('app_state');
export const snapshot = () => invoke<{ drives: Drive[] }>('disks_snapshot');
export const locate = (args: string[]) =>
	invoke<{ target: Target | null; image: ChosenImage | null; space: string | null }>('disks_locate', { arguments: args });
export const formats = () => invoke<Support[]>('disks_formats');

export const mount = (block: string) => invoke<string>('disks_mount', { block }, WAIT);
export const unmount = (block: string) => invoke<void>('disks_unmount', { block }, WAIT);
export const setLabel = (block: string, label: string) => invoke<void>('disks_label', { block, label }, WAIT);
export const setStartup = (block: string, directory: string | null, readOnly: boolean) =>
	invoke<void>('disks_startup', { block, directory, readOnly }, WAIT);
export const openFolder = (path: string) => invoke<void>('disks_open_folder', { path });

export const formatVolume = (block: string, format: Format) => invoke<void>('disks_format_volume', { block, format }, WAIT);
export const formatDrive = (block: string, size: number, removable: boolean, format: Format) =>
	invoke<void>('disks_format_drive', { block, size, removable, format }, WAIT);
export const createPartition = (table: string, offset: number, size: number, format: Format) =>
	invoke<void>('disks_create_partition', { table, offset, size, format }, WAIT);
export const deletePartition = (block: string) => invoke<void>('disks_delete_partition', { block }, WAIT);
export const resize = (block: string, size: number) => invoke<void>('disks_resize', { block, size }, WAIT);

export const unlock = (block: string, passphrase: string | null, remember: boolean) =>
	invoke<boolean>('disks_unlock', { block, passphrase, remember }, WAIT);
export const lock = (block: string) => invoke<void>('disks_lock', { block }, WAIT);
export const changePassphrase = (block: string, current: string, next: string) =>
	invoke<void>('disks_change_passphrase', { block, current, next }, WAIT);
export const remembered = (block: string) => invoke<boolean>('disks_remembered', { block });
export const forgetPassphrase = (block: string) => invoke<void>('disks_forget_passphrase', { block }, WAIT);

export const safelyRemove = (drive: string, block: string) => invoke<void>('disks_safely_remove', { drive, block }, WAIT);
export const startSelftest = (drive: string, extended: boolean) => invoke<void>('disks_selftest', { drive, extended }, WAIT);
export const stopSelftest = (drive: string) => invoke<void>('disks_selftest_stop', { drive }, WAIT);

export const imageFolder = () => invoke<string>('disks_image_folder');
export const chooseFolder = () => invoke<string | null>('disks_image_choose_folder');
export const createImage = (block: string, path: string) => invoke<void>('disks_image_create', { block, path }, WAIT);
export const chooseImage = () => invoke<ChosenImage | null>('disks_image_choose');
export const restoreImage = (block: string, path: string) => invoke<void>('disks_image_restore', { block, path }, WAIT);
export const cancelImage = () => invoke<void>('disks_image_cancel');

export const trust = {
	state: () => invoke<Protection>('trust_state'),
	check: (block: string) => invoke<EncryptionCheck>('trust_check', { block }, WAIT),
	recoveryKey: () => invoke<string>('trust_recovery_key'),
	encrypt: (block: string, recoveryKey: string, passphrase: string, autoUnlock: boolean) =>
		invoke<void>('trust_encrypt', { block, recoveryKey, passphrase, autoUnlock }, WAIT),
	format: (block: string, format: Format, recoveryKey: string, autoUnlock: boolean) =>
		invoke<void>('trust_format', { block, format, recoveryKey, autoUnlock }, WAIT),
	decrypt: (block: string, unlock: string) => invoke<Outcome<null>>('trust_decrypt', { block, unlock }, WAIT),
	unlocking: (block: string, unlock: string, recoveryKey: string, autoUnlock: boolean) =>
		invoke<Outcome<null>>('trust_unlocking', { block, unlock, recoveryKey, autoUnlock }, WAIT),
	pause: (uuid: string) => invoke<void>('trust_pause', { uuid }, WAIT),
	resume: (uuid: string, unlock: string) => invoke<Outcome<null>>('trust_resume', { uuid, unlock }, WAIT),
	showKey: (uuid: string) => invoke<string>('trust_show_key', { uuid }, WAIT),
	saveKey: (key: string, name: string) => invoke<boolean>('trust_save_key', { key, name }, WAIT),
	printKey: (key: string, name: string) => invoke<void>('trust_print_key', { key, name })
};

export const space = {
	scan: (path: string) => invoke<SpaceUpdate>('space_scan', { path }),
	view: (path: string[]) => invoke<SpaceUpdate>('space_view', { path }),
	trash: (path: string[]) => invoke<SpaceUpdate>('space_trash', { path }),
	show: (path: string[]) => invoke<void>('space_show', { path }),
	stop: () => invoke<void>('space_stop')
};

export const events = {
	changed: (callback: (state: { drives: Drive[] }) => void) => listen('disks.changed', callback),
	image: (callback: (progress: ImageProgress) => void) => listen('disks.image', callback),
	space: (callback: (update: SpaceUpdate) => void) => listen('space.update', callback),
	trust: (callback: (protection: Protection) => void) => listen('disks.trust', callback),
	activated: (callback: (activation: { arguments: string[] }) => void) => listen('singleInstance.activate', callback)
};
