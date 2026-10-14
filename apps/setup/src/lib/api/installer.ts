import { invoke, listen } from '@lantharos/sabine';

export type Phase = 'live' | 'first-boot' | 'installed';
export type Stage = 'idle' | 'preparing' | 'copying' | 'waiting' | 'configuring' | 'finished' | 'failed';
export type DriveKind = 'nvme' | 'ssd' | 'hdd' | 'usb' | 'card' | 'optical' | 'image';
export type DriveBlock = 'running' | 'read-only' | 'too-small';
export type WindowsBlock = 'bitlocker' | 'hibernated' | 'dirty' | 'full' | 'small-esp';

export interface InstallerState {
	phase: Phase;
	stage: Stage;
	progress: number;
	error: string;
	secureBootCode: string;
}

export interface Space {
	offset: number;
	size: number;
}

export interface WindowsVolume {
	block: string;
	offset: number;
	size: number;
	used: number;
	smallest: number;
	room: number;
	version: string | null;
	fastStartup: boolean;
	universalClock: boolean;
	bluetooth: number;
	blocked: WindowsBlock | null;
}

export interface Drive {
	block: string;
	device: string;
	name: string;
	size: number;
	kind: DriveKind;
	removable: boolean;
	blocked: DriveBlock | null;
	partitions: number;
	esp: Space | null;
	windows: WindowsVolume | null;
	free: Space[];
}

export interface Keyboard {
	layout: string;
	variant: string;
}

export interface Hints {
	timezone: string | null;
	keyboard: Keyboard | null;
	locale: string | null;
}

export interface Survey {
	drives: Drive[];
	hints: Hints;
	firmwareLanguage: string | null;
	smallestSystem: number;
}

export type Target =
	| { kind: 'whole'; drive: string }
	| { kind: 'alongside'; drive: string; size: number }
	| { kind: 'free'; drive: string; offset: number };

export interface WindowsChoices {
	fastStartupOff: boolean;
	universalClock: boolean;
	bluetooth: boolean;
}

export interface Regional {
	locale: string;
	keyboard: Keyboard;
	timezone: string;
	hostname: string;
}

const SURVEY_TIMEOUT = 120_000;
const WAIT_FOR_PERSON = 300_000;

export const state = () => invoke<InstallerState | null>('installer_state');
export const survey = () => invoke<Survey>('installer_survey', {}, { timeoutMs: SURVEY_TIMEOUT });
export const install = (target: Target, variant: string, windows: WindowsChoices) =>
	invoke<void>('installer_install', { value: { target, variant, windows } }, { timeoutMs: WAIT_FOR_PERSON });
export const configure = (regional: Regional) => invoke<void>('installer_configure', { value: regional }, { timeoutMs: WAIT_FOR_PERSON });
export const createAccount = (name: string, fullName: string, password: string) =>
	invoke<void>('installer_account', { name, fullName, password }, { timeoutMs: WAIT_FOR_PERSON });
export const finishFirstBoot = () => invoke<void>('installer_finish_first_boot', {}, { timeoutMs: WAIT_FOR_PERSON });
export const onChanged = (callback: (state: InstallerState) => void) => listen<InstallerState>('installer.changed', callback);
