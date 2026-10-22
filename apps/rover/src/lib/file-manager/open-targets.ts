import { parent } from '@luft/ui';
import * as api from '#lib/bridge/index.js';
import type { SingleInstanceActivation } from '#lib/bridge/index.js';
import { isArchive } from '#lib/features/archives.js';
import type { Launch } from '#lib/types/index.js';
import { looksRemote } from './location/addresses';
import type { FileManager } from './manager.svelte';

export async function openLaunch(manager: FileManager, { paths, reveal }: Launch) {
	for (const [index, path] of paths.entries()) {
		await open(manager, path, reveal, index === 0 ? manager.navigate : manager.openTab);
	}
}

export async function openActivation(manager: FileManager, activation: SingleInstanceActivation) {
	const { paths, reveal } = await api.resolveArguments(activation);
	for (const path of paths) await open(manager, path, reveal, manager.openTab);
}

async function open(manager: FileManager, path: string, reveal: boolean, show: (folder: string) => Promise<void>) {
	if (looksRemote(path)) return manager.openAddress(path, show);
	const entry = await api.getFileInfo(path).catch(() => null);
	if (!entry || entry.isDir) return show(path);
	await show(parent(entry.path));
	manager.selectOnly(entry.path);
	if (!reveal && isArchive(entry.name)) await manager.actions.extractNextTo(entry.path);
}
