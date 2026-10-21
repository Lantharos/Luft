import { appearance } from '@luft/ui';
import { backend } from '#lib/bridge/index.js';
import { fedora } from '#lib/fedora/fedora.svelte.js';
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

function openPage(argumentsList: (string | null)[]) {
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
	fedora.available = state.fedora;
	appearance.start(state);
	openPage([state.page]);
	openFiles(state.files);
	backend.onActivated(async ({ arguments: list, workingDirectory }) => {
		openPage(list);
		openFiles(await backend.activationFiles(list, workingDirectory));
	});
	void fedora.load();
	await Promise.all([operations.start(), library.start()]);
}
