import type { CatalogApp, Origin, Permissions, StoreDetails } from '#lib/bindings.js';

export type { CatalogApp };

export const catalogKey = (app: Pick<CatalogApp, 'origin' | 'id'>) => `${app.origin}:${app.id}`;

export interface Screenshot {
	url: string;
	caption: string | null;
}

export interface Release {
	version: string;
	date: number | null;
	notes: string;
}

export interface AppDetails {
	id: string;
	origin: Origin;
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
	store: StoreDetails | null;
}
