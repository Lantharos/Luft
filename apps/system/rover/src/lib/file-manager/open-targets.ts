import { parent } from '@luft/ui';
import type { SingleInstanceEvent } from '@lantharos/sabine';
import { commands } from '#lib/bindings.js';
import type { Launch } from '#lib/bindings.js';
import { isArchive } from '#lib/features/archives.js';
import { looksRemote } from './location/addresses';
import type { FileManager } from './manager.svelte';

export async function openLaunch(manager: FileManager, { paths, reveal }: Launch) {
	for (const [index, path] of paths.entries()) {
		await open(manager, path, reveal, index === 0 ? manager.navigate : manager.openTab);
	}
}

export async function openActivation(manager: FileManager, activation: SingleInstanceEvent) {
	const { paths, reveal } = await commands.resolveArguments(activation);
	for (const path of paths) await open(manager, path, reveal, manager.openTab);
}

async function open(manager: FileManager, path: string, reveal: boolean, show: (folder: string) => Promise<void>) {
	if (looksRemote(path)) return manager.openAddress(path, show);
	const entry = await commands.getFileInfo({ path }).catch(() => null);
	if (!entry || entry.isDir) return show(path);
	await show(parent(entry.path));
	manager.selectOnly(entry.path);
	if (!reveal && isArchive(entry.name)) await manager.actions.extractNextTo(entry.path);
}
