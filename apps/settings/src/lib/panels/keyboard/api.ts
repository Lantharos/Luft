import { invoke } from '$lib/bridge';

export type Category = 'system' | 'windows' | 'workspaces' | 'screenshots' | 'media';

export interface Layout {
	id: string;
	name: string;
	custom: boolean;
}

export interface InputMethod {
	id: string;
	name: string;
	language: string;
}

export interface ShortcutEntry {
	schema: string;
	key: string;
	name: string;
	category: Category;
	defaults: string[];
}

interface Location {
	schema: string;
	path: string;
}

export const layouts = () => invoke<Layout[]>('keyboard_layouts');
export const inputMethods = () => invoke<InputMethod[]>('keyboard_input_methods');
export const keysInstalled = () => invoke<boolean>('keyboard_keys_installed');
export const openKeys = (link: string) => invoke<void>('keyboard_open_keys', { link });
export const shortcutEntries = () => invoke<ShortcutEntry[]>('keyboard_shortcuts');
export const appNames = (ids: string[]) => invoke<Record<string, string>>('keyboard_app_names', { ids });
export const writeSetting = (location: Location, key: string, value: unknown) => invoke<void>('settings_write', { ...location, key, value });
export const resetSetting = (location: Location, key: string) => invoke<void>('settings_reset', { ...location, key });
