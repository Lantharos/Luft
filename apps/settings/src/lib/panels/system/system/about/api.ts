import { activationToken } from '@luft/ui';
import { invoke } from '#lib/bridge.js';

export interface About {
	deviceName: string;
	hostname: string;
	system: string;
	kernel: string;
	processor: string | null;
	graphics: string[];
	memory: number | null;
	storage: { total: number; free: number; manageable: boolean } | null;
}

export const about = () => invoke<About>('about');
export const rename = (name: string) => invoke<void>('about_rename', { name });
export const openDisks = async () => invoke<void>('about_open_disks', { token: await activationToken() });

export interface OtherSystem {
	id: string;
	kind: 'windows' | 'linux' | 'old-system';
	name: string;
	size: number;
}

export const otherSystems = () => invoke<OtherSystem[]>('about_other_systems');
export const removeSystem = async (id: string) => invoke<void>('about_remove_system', { id, token: await activationToken() });

export interface Suggestion {
	step: string;
	detail: string;
	action: 'firmware-settings' | null;
}

export interface Problem {
	id: string;
	time: number;
	restart: 'graceful' | 'forced' | 'emergency';
	graphics: string[];
	evidence: string[];
	suggestions: Suggestion[];
}

export const problems = () => invoke<Problem[]>('about_problems');
export const restartToFirmware = () => invoke<void>('about_firmware_restart');
