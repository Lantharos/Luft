import { invoke } from '$lib/bridge';

export interface App {
	id: string;
	name: string;
	icon: string | null;
}

export type Category = 'browser' | 'email' | 'calendar' | 'music' | 'video' | 'photos' | 'text' | 'files';

export interface Handler {
	category: Category;
	apps: App[];
	current: string | null;
}

export interface StartupApp extends App {
	enabled: boolean;
}

export const defaults = () => invoke<Handler[]>('apps_defaults');
export const setDefault = (category: Category, app: string) => invoke<void>('apps_set_default', { category, app });
export const installedApps = () => invoke<App[]>('apps_installed');
export const startupApps = () => invoke<StartupApp[]>('apps_startup');
export const setStartup = (id: string, enabled: boolean) => invoke<void>('apps_startup_set', { id, enabled });
export const addStartup = (app: string) => invoke<void>('apps_startup_add', { app });

export function matches(app: App, query: string) {
	return app.name.toLowerCase().includes(query.trim().toLowerCase());
}
