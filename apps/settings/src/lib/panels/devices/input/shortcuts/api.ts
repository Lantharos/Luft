import { invoke } from '#lib/bridge.js';

export type Category = 'system' | 'windows' | 'tiling' | 'workspaces' | 'screenshots' | 'media';

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

export const shortcutEntries = () => invoke<ShortcutEntry[]>('keyboard_shortcuts');
export const appNames = (ids: string[]) => invoke<Record<string, string>>('keyboard_app_names', { ids });
export const writeSetting = (location: Location, key: string, value: unknown) => invoke<void>('settings_write', { ...location, key, value });
export const resetSetting = (location: Location, key: string) => invoke<void>('settings_reset', { ...location, key });
