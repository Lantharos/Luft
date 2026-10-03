import { invoke } from '$lib/bridge';

export interface About {
	deviceName: string;
	hostname: string;
	system: string;
	kernel: string;
	processor: string | null;
	graphics: string[];
	memory: number | null;
	storage: { total: number; free: number; manageable: boolean } | null;
	windowing: string;
}

export const about = () => invoke<About>('about');
export const rename = (name: string) => invoke<void>('about_rename', { name });
export const openDisks = () => invoke<void>('about_open_disks');

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
