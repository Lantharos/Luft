import { parent } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { Document } from './document.svelte';
import { reload } from './opening';
import type { Workspace } from './workspace.svelte';

export function watchedFolders(workspace: Workspace) {
	const folders = new Set(workspace.tree.folders);
	for (const document of workspace.documents) if (document.path) folders.add(parent(document.path));
	return [...folders];
}

async function check(workspace: Workspace, document: Document) {
	if (!document.path || document.saving) return;
	const stat = await commands.fileStat({ path: document.path });
	if (!stat) {
		document.disk = 'deleted';
		return;
	}
	if (document.stat && stat.modified === document.stat.modified && stat.size === document.stat.size) {
		if (document.disk === 'deleted') document.disk = 'current';
		return;
	}
	if (document.dirty) document.disk = 'changed';
	else await reload(workspace, document);
}

export async function filesChanged(workspace: Workspace, paths: string[]) {
	const changed = new Set(paths);
	await Promise.all([
		workspace.tree.refresh(paths),
		...workspace.documents.filter((document) => document.path && changed.has(document.path)).map((document) => check(workspace, document))
	]);
}

export function checkAll(workspace: Workspace) {
	return Promise.all(workspace.documents.map((document) => check(workspace, document)));
}

export async function keepMine(document: Document) {
	document.stat = document.path ? await commands.fileStat({ path: document.path }) : null;
	document.disk = 'current';
}
