import type { CatalogApp, InstalledApp } from '#lib/bindings.js';
import * as flathub from '#lib/catalog/flathub.js';
import * as store from '#lib/catalog/store.js';
import type { AppDetails } from '#lib/catalog/types.js';
import { library } from '#lib/state/library.svelte.js';
import type { AppTarget } from '#lib/state/navigation.svelte.js';

export interface Loaded {
	details: AppDetails | null;
	error: string | null;
	listing: CatalogApp | null;
}

export function details(listing: CatalogApp): Promise<AppDetails> {
	if (listing.origin === 'schelf') return store.storeDetails(listing.id);
	if (listing.origin === 'flathub') return flathub.details(listing.id);
	return store.fedoraDetails(listing);
}

const unlisted = (installed: InstalledApp, id: string): CatalogApp => ({
	id,
	kind: installed.source === 'extension' ? 'extension' : 'app',
	origin: 'schelf',
	name: installed.name,
	summary: installed.summary ?? '',
	icon: installed.icon,
	art: null,
	developer: null,
	package: null
});

async function listingFor(installed: InstalledApp | null): Promise<CatalogApp | null> {
	if (installed?.listing) return (await store.entry(installed.listing)) ?? unlisted(installed, installed.listing);
	if (installed?.source === 'flatpak' && installed.origin === 'flathub') {
		const found = await store.entry(installed.id).catch(() => null);
		if (found?.origin === 'flathub') return found;
		return { id: installed.id, kind: 'app', origin: 'flathub', name: installed.name, summary: installed.summary ?? '', icon: null, art: null, developer: null, package: null };
	}
	return null;
}

export async function load(target: AppTarget): Promise<Loaded> {
	const listing = 'listing' in target ? target.listing : await listingFor(library.byKey(target.installed)).catch(() => null);
	if (!listing) return { details: null, error: null, listing };
	try {
		return { details: await details(listing), error: null, listing };
	} catch (reason) {
		return { details: null, error: String(reason), listing };
	}
}

export function installedFor(target: AppTarget): InstalledApp | null {
	if ('installed' in target) return library.byKey(target.installed);
	const { listing } = target;
	if (listing.origin === 'schelf') return library.installed.find((app) => app.listing === listing.id) ?? null;
	if (listing.origin === 'flathub') return library.flatpak(listing.id);
	return library.system(listing.package ?? listing.id);
}
