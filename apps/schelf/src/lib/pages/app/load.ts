import type { InstalledApp } from '#lib/bridge/types.js';
import * as flathub from '#lib/catalog/flathub.js';
import type { AppDetails, Origin } from '#lib/catalog/types.js';
import { flathubId } from '#lib/fedora/catalog.js';
import { fedora } from '#lib/fedora/fedora.svelte.js';
import { backend } from '#lib/bridge/index.js';
import { library } from '#lib/state/library.svelte.js';
import type { AppTarget } from '#lib/state/navigation.svelte.js';

export interface Listing {
	origin: Origin;
	id: string;
}

export interface Loaded {
	details: AppDetails | null;
	error: string | null;
	listing: Listing | null;
	alternatives: Listing[];
}

async function fetchDetails(listing: Listing | null): Promise<{ details: AppDetails | null; error: string | null }> {
	if (!listing) return { details: null, error: null };
	try {
		const details = listing.origin === 'flathub' ? await flathub.details(backend, listing.id) : await fedora.details(listing.id);
		return { details, error: null };
	} catch (reason) {
		return { details: null, error: String(reason) };
	}
}

function listingFor(installed: InstalledApp): Listing | null {
	if (installed.source === 'flatpak' && installed.origin === 'flathub') return { origin: 'flathub', id: installed.id };
	const match = installed.source === 'package' ? fedora.find(installed.id) : null;
	if (match) return { origin: 'fedora', id: match.id };
	return null;
}

async function alternativesFor(listing: Listing): Promise<Listing[]> {
	if (listing.origin === 'flathub') {
		const match = fedora.find(listing.id);
		return match ? [listing, { origin: 'fedora', id: match.id }] : [];
	}
	const id = flathubId(listing.id);
	const exists = await backend
		.flathub(`summary/${id}`)
		.then(() => true)
		.catch(() => false);
	return exists ? [{ origin: 'flathub', id }, listing] : [];
}

export async function load(target: AppTarget): Promise<Loaded> {
	await fedora.load();
	const listing = 'installed' in target ? (library.byKey(target.installed) ? listingFor(library.byKey(target.installed)!) : null) : target;
	const [{ details, error }, alternatives] = await Promise.all([fetchDetails(listing), listing ? alternativesFor(listing) : Promise.resolve([])]);
	return { details, error, listing, alternatives };
}

export function installedFor(target: AppTarget, details: AppDetails | null): InstalledApp | null {
	if ('installed' in target) return library.byKey(target.installed);
	if (target.origin === 'flathub') return library.flatpak(target.id);
	return details?.package ? library.package(details.package) : null;
}
