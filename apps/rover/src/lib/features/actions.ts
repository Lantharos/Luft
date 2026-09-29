import { getFileInfo } from '$lib/api';
import type { FileManager } from '$lib/file-manager/manager.svelte';
import type { FileEntry } from '$lib/types';
import * as api from './api';
import { dialogs } from './dialogs.svelte';
import { search } from './search.svelte';

export function selection(manager: FileManager) {
	return manager.displayEntries.filter((entry) => manager.selection.has(entry.path));
}

export function targetsOf(manager: FileManager, target: FileEntry) {
	return manager.selection.has(target.path) ? selection(manager) : [target];
}

export function duplicate(manager: FileManager, entries: FileEntry[]) {
	api.duplicateItems(entries.map((entry) => entry.path)).catch(manager.notify);
}

export function copyPaths(manager: FileManager, entries: FileEntry[]) {
	navigator.clipboard.writeText(entries.map((entry) => entry.path).join('\n')).catch(manager.notify);
}

export function openTerminal(manager: FileManager, path: string) {
	api.openTerminal(path).catch(manager.notify);
}

export function extract(manager: FileManager, entries: FileEntry[]) {
	api.extractArchives(
		entries.map((entry) => entry.path),
		manager.currentPath
	).catch(manager.notify);
}

export function rename(manager: FileManager, entries: FileEntry[]) {
	if (entries.length > 1) dialogs.rename(entries);
	else if (entries[0]) manager.startRename(entries[0]);
}

export function compress(manager: FileManager, entries: FileEntry[]) {
	dialogs.compress(entries, manager.currentPath);
}

export function showProperties(manager: FileManager, entries: FileEntry[]) {
	dialogs.properties(entries);
}

export function showFolderProperties(manager: FileManager) {
	getFileInfo(manager.currentPath)
		.then((entry) => dialogs.properties([entry]))
		.catch(manager.notify);
}

export function searchHere(manager: FileManager) {
	if (manager.view === 'home') search.show(manager.currentPath || manager.homePath);
}
