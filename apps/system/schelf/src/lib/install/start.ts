import { i18n } from '@luft/i18n';
import { appearance } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { library } from '#lib/state/library.svelte.js';
import { operations } from '#lib/state/operations.svelte.js';

const ROUTE = /^#install(-dialog)?\/(\d+)$/;

export type InstallRoute = { window: 'install' | 'dialog'; id: number };

export function installRoute(): InstallRoute | null {
	const match = ROUTE.exec(location.hash);
	return match ? { window: match[1] ? 'dialog' : 'install', id: Number(match[2]) } : null;
}

export async function startInstall(request: number) {
	const state = await commands.installState({ request });
	appearance.start(state);
	await Promise.all([i18n.ready, operations.start(), library.watch()]);
	return state.path;
}

export async function startDialog(dialog: number) {
	const state = await commands.installDialogState({ dialog });
	appearance.start(state);
	await Promise.all([i18n.ready, operations.start(), library.watch()]);
	return state;
}
