import type { Permissions, Screenshot } from '#lib/bindings.js';

export interface CatalogApp {
	key: string;
	id: string;
	name: string;
	summary: string;
	icon: string | null;
	developer: string | null;
}

export interface Release {
	version: string;
	date: number | null;
	notes: string;
}

export interface AppDetails {
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
	permissions: Permissions | null;
}

export interface Page {
	apps: CatalogApp[];
	pages: number;
}
