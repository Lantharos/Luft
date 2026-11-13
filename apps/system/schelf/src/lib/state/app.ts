import { appWindow, events as sabineEvents } from '@lantharos/sabine';
import { appearance, keepWindowState } from '@luft/ui';
import { commands, type CatalogApp } from '#lib/bindings.js';
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

function openFiles(files: string[]) {
	const [path] = files;
	if (path) navigation.open({ page: 'file', path });
}

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

function openPage(argumentsList: (string | null)[]) {
	const listing = argumentsList.find((argument) => argument?.startsWith(LISTING));
	if (listing) {
		void openListing(decodeURIComponent(listing.slice(LISTING.length)));
		return;
	}
	const app = argumentsList.find((argument) => argument?.startsWith(APP));
	if (app) {
		void openApp(decodeURIComponent(app.slice(APP.length)));
		return;
	}
	const fullAccess = argumentsList.find((argument) => argument?.startsWith(FULL_ACCESS));
	if (fullAccess) {
		void askFullAccess(decodeURIComponent(fullAccess.slice(FULL_ACCESS.length)));
		return;
	}
	const access = argumentsList.find((argument) => argument?.startsWith(ACCESS));
	if (access) {
		void reviewAccess(decodeURIComponent(access.slice(ACCESS.length)));
		return;
	}
	const search = argumentsList.find((argument) => argument?.startsWith(SEARCH));
	if (search) {
		navigation.query = decodeURIComponent(search.slice(SEARCH.length));
		navigation.search(navigation.query);
		return;
	}
	const route = argumentsList.map((argument) => PAGES[argument ?? '']).find(Boolean);
	if (route) navigation.open(route);
}

export async function start() {
	const [state, kept] = await Promise.all([commands.appState(), appWindow.restoredState<Route[]>()]);
	appearance.start(state);
	if (kept && !state.page && !state.files.length) navigation.reopen(kept);
	openPage([state.page]);
	openFiles(state.files);
	keepWindowState(navigation.kept);
	sabineEvents.singleInstance(async ({ arguments: list, workingDirectory }) => {
		openPage(list);
		openFiles(await commands.appActivationFiles({ arguments: list, workingDirectory }));
	});
	await Promise.all([operations.start(), library.start(), catalog.start(), account.start()]);
}
