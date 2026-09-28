import { invoke, listen } from '$lib/bridge';

export interface Wallpaper {
	path: string;
	name: string;
	live: boolean;
}

export const wallpapers = () => invoke<Wallpaper[]>('appearance_wallpapers');
export const onWallpapersChanged = (callback: (wallpapers: Wallpaper[]) => void) => listen<Wallpaper[]>('appearance.wallpapers', callback);
export const thumbnail = (path: string) => invoke<string>('appearance_thumbnail', { path });
export const addWallpapers = () => invoke<void>('appearance_add_wallpapers');
export const openFolder = () => invoke<void>('appearance_open_folder');
