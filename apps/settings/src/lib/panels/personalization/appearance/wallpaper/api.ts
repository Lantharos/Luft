import { activationToken } from '@luft/ui';
import { invoke, listen } from '#lib/bridge.js';

export interface Wallpaper {
	path: string;
	name: string;
	live: boolean;
}

export type Focus = [number, number];

export const CENTER: Focus = [0.5, 0.5];

export const wallpapers = () => invoke<Wallpaper[]>('appearance_wallpapers');
export const onWallpapersChanged = (callback: (wallpapers: Wallpaper[]) => void) => listen<Wallpaper[]>('appearance.wallpapers', callback);
export const thumbnail = (path: string) => invoke<string>('appearance_thumbnail', { path });
export const wallpaperFocus = (path: string) => invoke<Focus>('appearance_wallpaper_focus', { path });
export const addWallpapers = () => invoke<void>('appearance_add_wallpapers');
export const openFolder = async () => invoke<void>('appearance_open_folder', { token: await activationToken() });

export function uriToPath(uri: string) {
	return uri.startsWith('file://') ? decodeURIComponent(uri.slice('file://'.length)) : uri;
}

export function pathToUri(path: string) {
	return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
}

export const objectPosition = ([x, y]: Focus) => `${x * 100}% ${y * 100}%`;
