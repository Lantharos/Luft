import { print } from '@lantharos/sabine';
import { commands } from '#lib/bindings.js';
import type { FileEntry } from '#lib/bindings.js';
import * as api from '#lib/bridge/index.js';
import type { FileManager } from '#lib/file-manager/manager.svelte.js';
import { isPrintable } from '#lib/utils/kinds.js';
import { dialogs } from './dialogs.svelte';
import { search } from './search.svelte';

export function selection(manager: FileManager) {
	return manager.displayEntries.filter((entry) => manager.selection.has(entry.path));
}

export function targetsOf(manager: FileManager, target: FileEntry) {
	return manager.selection.has(target.path) ? selection(manager) : [target];
}

export function duplicate(manager: FileManager, entries: FileEntry[]) {
	commands.duplicateItems({ paths: entries.map((entry) => entry.path) }).catch(manager.notify);
}

export function copyPaths(manager: FileManager, entries: FileEntry[]) {
	navigator.clipboard.writeText(entries.map((entry) => entry.path).join('\n')).catch(manager.notify);
}

export function openTerminal(manager: FileManager, path: string) {
	api.openTerminal(path).catch(manager.notify);
}

export function exploreSpace(manager: FileManager, path: string) {
	api.exploreSpace(path).catch(manager.notify);
}

export function extract(manager: FileManager, entries: FileEntry[]) {
	commands.extractArchives({ paths: entries.map((entry) => entry.path), destination: manager.currentPath }).then(manager.selectWhenDone, manager.notify);
}

export function printable(entries: FileEntry[]) {
	return entries.length > 0 && entries.every(isPrintable);
}

export function printFiles(manager: FileManager, entries: FileEntry[]) {
	if (printable(entries)) print.files(entries.map((entry) => entry.path)).catch(manager.notify);
}

export function rename(manager: FileManager, entries: FileEntry[]) {
	if (entries.length > 1) dialogs.rename(entries);
	else if (entries[0]) manager.startRename(entries[0]);
}

export function compress(manager: FileManager, entries: FileEntry[]) {
	dialogs.compress(entries, manager.currentPath);
}

export function showProperties(entries: FileEntry[]) {
	dialogs.properties(entries);
}

export function showPathProperties(manager: FileManager, path: string) {
	commands.getFileInfo({ path })
		.then((entry) => dialogs.properties([entry]))
		.catch(manager.notify);
}

export function searchHere(manager: FileManager) {
	if (manager.view === 'home') search.show(manager.currentPath || manager.homePath);
}
