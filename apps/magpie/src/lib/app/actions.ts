import * as api from '$lib/api';
import { library } from '$lib/library/library.svelte';
import { player } from '$lib/music/player.svelte';
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
