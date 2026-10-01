import { isAvailable } from '@lantharos/sabine';
import { appearance } from '@luft/ui';
import { connect } from '$lib/bridge';
import { setBackend } from './backend';
import { catalog } from './catalog.svelte';
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

function openPage(argumentsList: (string | null)[]) {
	const route = argumentsList.map((argument) => PAGES[argument ?? '']).find(Boolean);
	if (route) navigation.open(route);
}

export async function start() {
	const backend = await connect();
	setBackend(backend);
	const state = await backend.appState();
	if (isAvailable()) appearance.start(state);
	else appearance.scheme = state.scheme;
	openPage([state.page]);
	openFiles(state.files);
	backend.onActivated(async ({ arguments: list, workingDirectory }) => {
		openPage(list);
		openFiles(await backend.activationFiles(list, workingDirectory));
	});
	void catalog.loadFedora();
	await Promise.all([operations.start(), library.start()]);
}
