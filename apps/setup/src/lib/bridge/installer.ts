import type { Intent } from '#lib/bindings.js';

export type DriveKind = 'nvme' | 'ssd' | 'hdd' | 'usb' | 'card' | 'optical' | 'image';
export type DriveBlock = 'running' | 'read-only' | 'too-small';
export type WindowsBlock = 'bitlocker' | 'hibernated' | 'dirty' | 'full';
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
	otherDrive: boolean;
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

export interface Encryption {
	recoveryKey: string;
	passphrase: string;
}

export interface WindowsChoices {
	fastStartupOff: boolean;
	universalClock: boolean;
	bluetooth: boolean;
}

export type Regional = {
	locale: string;
	keyboard: Keyboard;
	timezone: string;
	hostname: string;
};

export type InstallPlan = {
	target: Target;
	variant: string;
	windows: WindowsChoices;
	encryption: Encryption | null;
};
