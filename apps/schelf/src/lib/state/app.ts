import { events as sabineEvents } from '@lantharos/sabine';
import { appearance } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { library } from './library.svelte';
import { navigation, type Route } from './navigation.svelte';
import { operations } from './operations.svelte';

const PAGES: Record<string, Route> = {
	'schelf:updates': { page: 'updates' },
	'schelf:installed': { page: 'installed' }
};

function openFiles(files: string[]) {
	const [path] = files;
	if (path) navigation.open({ page: 'file', path });
}

const SEARCH = 'schelf:search?';
const FULL_ACCESS = 'schelf:full-access?';
const APP = 'schelf:app?';

async function askFullAccess(id: string) {
	if (!library.loaded) await library.refresh();
	const app = library.byKey(`appimage/${id}`) ?? library.flatpak(id);
	if (app) navigation.open({ page: 'app', target: { installed: app.key }, name: app.name, askFullAccess: true });
}

async function openApp(id: string) {
	if (!library.loaded) await library.refresh();
	const desktop = id.endsWith('.desktop') ? id : `${id}.desktop`;
	const app = library.installed.find((entry) => entry.desktop === desktop);
	if (app) navigation.open({ page: 'app', target: { installed: app.key }, name: app.name });
}

function openPage(argumentsList: (string | null)[]) {
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
	const state = await commands.appState();
	appearance.start(state);
	openPage([state.page]);
	openFiles(state.files);
	sabineEvents.singleInstance(async ({ arguments: list, workingDirectory }) => {
		openPage(list);
		openFiles(await commands.appActivationFiles({ arguments: list, workingDirectory }));
	});
	await Promise.all([operations.start(), library.start()]);
}
