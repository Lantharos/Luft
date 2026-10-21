import { parent } from '@luft/ui';
import * as api from '#lib/api.js';
import type { SingleInstanceActivation } from '#lib/api.js';
import { looksRemote } from './location/addresses';
import type { FileManager } from './manager.svelte';

export async function openLaunchPaths(manager: FileManager, paths: string[]) {
	for (const [index, path] of paths.entries()) {
		await open(manager, path, index === 0 ? manager.navigate : manager.openTab);
	}
}

export async function openActivation(manager: FileManager, activation: SingleInstanceActivation) {
	for (const path of await api.resolveArguments(activation)) await open(manager, path, manager.openTab);
}

async function open(manager: FileManager, path: string, show: (folder: string) => Promise<void>) {
	if (looksRemote(path)) return manager.openAddress(path, show);
	const entry = await api.getFileInfo(path).catch(() => null);
	if (!entry || entry.isDir) return show(path);
	await show(parent(entry.path));
	manager.selectOnly(entry.path);
}
