import type { App } from '$lib/app.svelte';
import type { Document } from '$lib/documents/document.svelte';
import { openPath } from '$lib/documents/opening';
import type { MenuEntry } from '$lib/menus.svelte';

function pathEntries(app: App, path: string): MenuEntry[] {
	return [
		{ label: 'Show in Files', run: () => void app.backend.showInFolder(path) },
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
		document.path ? [...(workspace.tree.root ? [{ label: 'Reveal in Sidebar', run: () => void app.reveal(document) }] : []), ...pathEntries(app, document.path)] : []
	];
}

export function entryMenu(app: App, path: string, folder: boolean): MenuEntry[][] {
	const open = folder ? { label: 'Open as Folder', run: () => void app.workspace.showFolder(path) } : { label: 'Open', run: () => void openPath(app.workspace, path) };
	return [[open], pathEntries(app, path)];
}
