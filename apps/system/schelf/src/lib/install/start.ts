import { i18n } from '@luft/i18n';
import { appearance } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { library } from '#lib/state/library.svelte.js';
import { operations } from '#lib/state/operations.svelte.js';

const REQUEST = /^#install\/(\d+)$/;

export function installRequest() {
	const match = REQUEST.exec(location.hash);
	return match ? Number(match[1]) : null;
}

export async function startInstall(request: number) {
	const state = await commands.installState({ request });
	appearance.start(state);
	await Promise.all([i18n.ready, operations.start(), library.watch()]);
	return state.path;
}
