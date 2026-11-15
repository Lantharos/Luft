import { appWindow } from '@lantharos/sabine';
import { appearance, keepWindowState } from '@luft/ui';
import { commands, events, type CatalogApp } from '#lib/bindings.js';
import { developer } from '#lib/developer/state/developer.svelte.js';
import * as store from '#lib/catalog/store.js';
import { account } from './account.svelte';
import { catalog } from './catalog.svelte';
import { library } from './library.svelte';
import { navigation, type Route } from './navigation.svelte';
import { operations } from './operations.svelte';

const PAGES: Record<string, Route> = {
	'schelf:updates': { page: 'updates' },
	'schelf:installed': { page: 'installed' },
	'schelf:extensions': { page: 'extensions' }
};

const SEARCH = 'schelf:search?';
const FULL_ACCESS = 'schelf:full-access?';
const ACCESS = 'schelf:access?';
const APP = 'schelf:app?';
const LISTING = 'schelf:app/';

async function askFullAccess(id: string) {
	if (!library.loaded) await library.refresh();
	const app = library.byKey(`appimage/${id}`) ?? library.flatpak(id);
	if (app) navigation.open({ page: 'app', target: { installed: app.key }, name: app.name, askFullAccess: true });
}

async function reviewAccess(id: string) {
	if (!library.loaded) await library.refresh();
	const app = library.byKey(`appimage/${id}`);
	if (app) navigation.open({ page: 'app', target: { installed: app.key }, name: app.name, reviewAccess: true });
}

async function openApp(id: string) {
	if (!library.loaded) await library.refresh();
	const desktop = id.endsWith('.desktop') ? id : `${id}.desktop`;
	const app = library.installed.find((entry) => entry.desktop === desktop);
	if (app) navigation.open({ page: 'app', target: { installed: app.key }, name: app.name });
}

async function unlisted(id: string): Promise<CatalogApp | null> {
	const details = await commands.storeDetails({ id }).catch(() => null);
	if (!details) return null;
	const { kind, name, summary, icon, developer, screenshots } = details;
	const art = kind === 'extension' ? (screenshots[0]?.url ?? null) : null;
	return { id: details.id, kind, origin: 'schelf', name, summary, icon, art, developer, package: null };
}

export async function openListing(id: string) {
	const listing = (await store.entry(id).catch(() => null)) ?? (await unlisted(id));
	if (listing) {
		navigation.open({ page: 'app', target: { listing }, name: listing.name });
		return;
	}
	if (!library.loaded) await library.refresh();
	const app = library.installed.find((entry) => entry.listing === id);
	if (app) navigation.open({ page: 'app', target: { installed: app.key }, name: app.name });
}

function openPage(url: string) {
	if (url.startsWith(LISTING)) return void openListing(decodeURIComponent(url.slice(LISTING.length)));
	if (url.startsWith(APP)) return void openApp(decodeURIComponent(url.slice(APP.length)));
	if (url.startsWith(FULL_ACCESS)) return void askFullAccess(decodeURIComponent(url.slice(FULL_ACCESS.length)));
	if (url.startsWith(ACCESS)) return void reviewAccess(decodeURIComponent(url.slice(ACCESS.length)));
	if (url.startsWith(SEARCH)) {
		navigation.query = decodeURIComponent(url.slice(SEARCH.length));
		navigation.search(navigation.query);
		return;
	}
	const route = PAGES[url];
	if (route) navigation.open(route);
}

export async function start() {
	const [state, kept] = await Promise.all([commands.appState(), appWindow.restoredState<Route[]>()]);
	appearance.start(state);
	if (kept && !state.page) navigation.reopen(kept);
	if (state.page) openPage(state.page);
	keepWindowState(navigation.kept);
	developer.start();
	events.schelfPage(async () => {
		const page = await commands.appPage();
		if (page) openPage(page);
	});
	await Promise.all([operations.start(), library.start(), catalog.start(), account.start()]);
}
