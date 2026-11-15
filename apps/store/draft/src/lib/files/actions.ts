import { t } from '@luft/i18n';
import type { App } from '#lib/app/app.svelte.js';
import { showInFolder } from '#lib/bridge/index.js';
import type { Document } from '#lib/documents/document.svelte.js';
import { openPath } from '#lib/documents/opening.js';
import type { MenuEntry } from '#lib/app/menus.svelte.js';

function pathEntries(path: string): MenuEntry[] {
	return [
		{ label: t('draft-command-show-in-rover'), run: () => void showInFolder(path) },
		{ label: t('draft-command-copy-path'), run: () => void navigator.clipboard.writeText(path) }
	];
}

export function documentMenu(app: App, document: Document): MenuEntry[][] {
	const { workspace } = app;
	return [
		[
			{ label: t('draft-menu-close'), run: () => void workspace.close(document) },
			...(workspace.documents.length > 1 ? [{ label: t('draft-menu-close-others'), run: () => void workspace.closeOthers(document) }] : [])
		],
		document.path ? [...(workspace.tree.root ? [{ label: t('draft-command-reveal'), run: () => void app.reveal(document) }] : []), ...pathEntries(document.path)] : []
	];
}

export function entryMenu(app: App, path: string, folder: boolean): MenuEntry[][] {
	const open = folder ? { label: t('draft-menu-open-as-folder'), run: () => void app.workspace.showFolder(path) } : { label: t('draft-menu-open'), run: () => void openPath(app.workspace, path) };
	return [[open], pathEntries(path)];
}
