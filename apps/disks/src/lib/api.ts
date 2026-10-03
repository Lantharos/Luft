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

export const CANCELLED = 'cancelled';

export const appState = () => invoke<AppState>('app_state');
export const snapshot = () => invoke<{ drives: Drive[] }>('disks_snapshot');
export const locate = (args: string[]) =>
	invoke<{ target: Target | null; image: ChosenImage | null; space: string | null }>('disks_locate', { arguments: args });
export const formats = () => invoke<Support[]>('disks_formats');

export const mount = (block: string) => invoke<string>('disks_mount', { block });
export const unmount = (block: string) => invoke<void>('disks_unmount', { block });
export const setLabel = (block: string, label: string) => invoke<void>('disks_label', { block, label });
export const setStartup = (block: string, directory: string | null, readOnly: boolean) =>
	invoke<void>('disks_startup', { block, directory, readOnly });
export const openFolder = (path: string) => invoke<void>('disks_open_folder', { path });

export const formatVolume = (block: string, format: Format) => invoke<void>('disks_format_volume', { block, format });
export const formatDrive = (block: string, size: number, removable: boolean, format: Format) =>
	invoke<void>('disks_format_drive', { block, size, removable, format });
export const createPartition = (table: string, offset: number, size: number, format: Format) =>
	invoke<void>('disks_create_partition', { table, offset, size, format });
export const deletePartition = (block: string) => invoke<void>('disks_delete_partition', { block });
export const resize = (block: string, size: number) => invoke<void>('disks_resize', { block, size });

export const unlock = (block: string, passphrase: string | null, remember: boolean) =>
	invoke<boolean>('disks_unlock', { block, passphrase, remember });
export const lock = (block: string) => invoke<void>('disks_lock', { block });
export const changePassphrase = (block: string, current: string, next: string) =>
	invoke<void>('disks_change_passphrase', { block, current, next });
export const remembered = (block: string) => invoke<boolean>('disks_remembered', { block });
export const forgetPassphrase = (block: string) => invoke<void>('disks_forget_passphrase', { block });

export const safelyRemove = (drive: string, block: string) => invoke<void>('disks_safely_remove', { drive, block });
export const startSelftest = (drive: string, extended: boolean) => invoke<void>('disks_selftest', { drive, extended });
export const stopSelftest = (drive: string) => invoke<void>('disks_selftest_stop', { drive });

export const imageFolder = () => invoke<string>('disks_image_folder');
export const chooseFolder = () => invoke<string | null>('disks_image_choose_folder');
export const createImage = (block: string, path: string) => invoke<void>('disks_image_create', { block, path });
export const chooseImage = () => invoke<ChosenImage | null>('disks_image_choose');
export const restoreImage = (block: string, path: string) => invoke<void>('disks_image_restore', { block, path });
export const cancelImage = () => invoke<void>('disks_image_cancel');

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
	activated: (callback: (activation: { arguments: string[] }) => void) => listen('singleInstance.activate', callback)
};
