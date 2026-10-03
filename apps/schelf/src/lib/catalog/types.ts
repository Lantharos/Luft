import type { Permissions, Screenshot } from '#lib/bridge/types.js';

export type Origin = 'flathub' | 'fedora';

export interface CatalogApp {
	key: string;
	origin: Origin;
	id: string;
	name: string;
	summary: string;
	icon: string | null;
	developer: string | null;
	package: string | null;
}

export interface Release {
	version: string;
	date: number | null;
	notes: string;
}

export interface AppDetails {
	origin: Origin;
	id: string;
	name: string;
	summary: string;
	description: string;
	icon: string | null;
	developer: string | null;
	license: string | null;
	homepage: string | null;
	screenshots: Screenshot[];
	release: Release | null;
	downloadSize: number | null;
	installedSize: number | null;
	verified: string | null;
	package: string | null;
	permissions: Permissions | null;
}

export interface Page {
	apps: CatalogApp[];
	pages: number;
}
