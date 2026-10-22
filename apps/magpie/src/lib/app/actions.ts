import { print } from '@lantharos/sabine';
import * as api from '#lib/bridge/api.js';
import { library } from '#lib/library/library.svelte.js';
import { player } from '#lib/music/player.svelte.js';
import { activePhoto } from '#lib/photo/active.svelte.js';
import { printPhoto } from '#lib/photo/print.js';
import { chrome } from './chrome.svelte';

export async function openFile() {
	const path = await api.chooseFile().catch(() => null);
	if (path) await library.open(path);
}

export async function openPaths(paths: string[]) {
	const [first, ...rest] = paths;
	if (!first) return;
	if (player.playing && library.group === 'audio') {
		const queued = await player.enqueue(paths);
		if (queued) return chrome.notify(queued === 1 ? 'Added to the queue' : `Added ${queued} songs to the queue`);
	}
	await library.open(first);
	if (rest.length && library.group === 'audio') await player.enqueue(rest);
}

function printJob() {
	const item = library.current;
	if (item?.kind === 'document') return () => print.files([item.path]);
	const source = activePhoto.source;
	if (item?.kind === 'image' && source && activePhoto.item?.path === item.path) return () => printPhoto(item, source);
	return null;
}

export function canPrint() {
	return printJob() !== null;
}

export async function printCurrent() {
	await printJob()?.().catch(() => chrome.notify("This couldn't be printed"));
}
