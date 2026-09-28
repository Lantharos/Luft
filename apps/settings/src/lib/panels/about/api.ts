import { invoke } from '$lib/bridge';

export interface About {
	deviceName: string;
	hostname: string;
	system: string;
	kernel: string;
	processor: string | null;
	graphics: string[];
	memory: number | null;
	storage: { total: number; free: number } | null;
	windowing: string;
}

export const about = () => invoke<About>('about');
export const rename = (name: string) => invoke<void>('about_rename', { name });
