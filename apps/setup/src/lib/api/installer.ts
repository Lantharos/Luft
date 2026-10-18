import { invoke, listen } from '@lantharos/sabine';

export type Phase = 'live' | 'first-boot' | 'installed';
export type Stage = 'idle' | 'preparing' | 'copying' | 'waiting' | 'configuring' | 'finished' | 'failed';
export type DriveKind = 'nvme' | 'ssd' | 'hdd' | 'usb' | 'card' | 'optical' | 'image';
export type DriveBlock = 'running' | 'read-only' | 'too-small';
export type WindowsBlock = 'bitlocker' | 'hibernated' | 'dirty' | 'full';
export type Intent = 'try' | 'install' | 'replace';
export type Layout = 'subvolumes' | 'separateHome' | 'single' | 'encrypted' | 'unknown';
export type SystemBlock = 'layout' | 'read-only' | 'startup' | 'no-account' | 'running';

export interface LinuxSystem {
	id: string;
	name: string;
	drive: string;
	layout: Layout;
	blocked: SystemBlock | null;
	owner: { name: string; fullName: string; password: boolean } | null;
	accounts: number;
	hostname: string | null;
	networks: number;
	drives: string[];
	packages: number;
	keepsOld: boolean;
	startup: 'esp' | 'boot' | null;
}

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
	startupSpace: number;
	windows: WindowsVolume | null;
	free: Space[];
	meet: boolean;
}

export interface Keyboard {
	layout: string;
	variant: string;
}

export interface Hints {
	language: string | null;
	locale: string | null;
	timezone: string | null;
	keyboards: Keyboard[];
}

export interface MeetSurvey {
	drive: string;
	space: Space | null;
	intent: Intent;
	movingBox: { bytes: number; fullName: string | null; userName: string | null } | null;
}

export interface Survey {
	drives: Drive[];
	hints: Hints;
	smallestSystem: number;
	meet: MeetSurvey | null;
	systems: LinuxSystem[];
}

export type Target =
	| { kind: 'whole'; drive: string }
	| { kind: 'alongside'; drive: string; size: number }
	| { kind: 'free'; drive: string; offset: number }
	| { kind: 'replace'; system: string };

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
