import { invoke } from '$lib/bridge';

export interface Wallpaper {
	path: string;
	darkPath: string | null;
	name: string;
}

export const wallpapers = () => invoke<Wallpaper[]>('appearance_wallpapers');
export const thumbnail = (path: string) => invoke<string>('appearance_thumbnail', { path });
export const chooseImage = () => invoke<string | null>('appearance_choose_image');
