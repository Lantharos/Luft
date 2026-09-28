import * as api from '$lib/api';
import type { SingleInstanceActivation } from '$lib/api';
import { parentPath } from '$lib/utils/paths';
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
	const entry = await api.getFileInfo(path).catch(() => null);
	if (!entry || entry.is_dir) return show(path);
	await show(parentPath(entry.path));
	manager.selectOnly(entry.path);
}
