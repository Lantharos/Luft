import type { InstalledApp } from '#lib/bindings.js';
import * as flathub from '#lib/catalog/flathub.js';
import type { AppDetails } from '#lib/catalog/types.js';
import { library } from '#lib/state/library.svelte.js';
import type { AppTarget } from '#lib/state/navigation.svelte.js';

export interface Loaded {
	details: AppDetails | null;
	error: string | null;
	listing: string | null;
}

async function fetchDetails(id: string | null): Promise<{ details: AppDetails | null; error: string | null }> {
	if (!id) return { details: null, error: null };
	try {
		return { details: await flathub.details(id), error: null };
	} catch (reason) {
		return { details: null, error: String(reason) };
	}
}

const listingFor = (installed: InstalledApp | null) => (installed?.source === 'flatpak' && installed.origin === 'flathub' ? installed.id : null);

export async function load(target: AppTarget): Promise<Loaded> {
	const listing = 'installed' in target ? listingFor(library.byKey(target.installed)) : target.id;
	return { ...(await fetchDetails(listing)), listing };
}

export function installedFor(target: AppTarget): InstalledApp | null {
	return 'installed' in target ? library.byKey(target.installed) : library.flatpak(target.id);
}
