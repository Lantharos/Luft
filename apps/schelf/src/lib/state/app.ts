import { appearance } from '@luft/ui';
import { backend } from '#lib/bridge/index.js';
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

async function askFullAccess(id: string) {
	if (!library.loaded) await library.refresh();
	const app = library.byKey(`appimage/${id}`) ?? library.flatpak(id);
	if (app) navigation.open({ page: 'app', target: { installed: app.key }, name: app.name, askFullAccess: true });
}

function openPage(argumentsList: (string | null)[]) {
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
	const state = await backend.appState();
	appearance.start(state);
	openPage([state.page]);
	openFiles(state.files);
	backend.onActivated(async ({ arguments: list, workingDirectory }) => {
		openPage(list);
		openFiles(await backend.activationFiles(list, workingDirectory));
	});
	await Promise.all([operations.start(), library.start()]);
}
