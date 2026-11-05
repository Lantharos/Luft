import type { App } from '#lib/app/app.svelte.js';
import { showInFolder } from '#lib/bridge/index.js';
import type { Document } from '#lib/documents/document.svelte.js';
import { openPath } from '#lib/documents/opening.js';
import type { MenuEntry } from '#lib/app/menus.svelte.js';

function pathEntries(path: string): MenuEntry[] {
	return [
		{ label: 'Show in Rover', run: () => void showInFolder(path) },
		{ label: 'Copy Path', run: () => void navigator.clipboard.writeText(path) }
	];
}

export function documentMenu(app: App, document: Document): MenuEntry[][] {
	const { workspace } = app;
	return [
		[
			{ label: 'Close', run: () => void workspace.close(document) },
			...(workspace.documents.length > 1 ? [{ label: 'Close Others', run: () => void workspace.closeOthers(document) }] : [])
		],
		document.path ? [...(workspace.tree.root ? [{ label: 'Reveal in Sidebar', run: () => void app.reveal(document) }] : []), ...pathEntries(document.path)] : []
	];
}

export function entryMenu(app: App, path: string, folder: boolean): MenuEntry[][] {
	const open = folder ? { label: 'Open as Folder', run: () => void app.workspace.showFolder(path) } : { label: 'Open', run: () => void openPath(app.workspace, path) };
	return [[open], pathEntries(path)];
}
