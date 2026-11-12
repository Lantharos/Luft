import { keepWindowState } from '@luft/ui';
import type { Item } from '#lib/bindings.js';
import { commands } from '#lib/bindings.js';
import { library } from '#lib/library/library.svelte.js';
import { chrome, type Mode } from './chrome.svelte';

export interface Shown {
	mode: Mode;
	folder: string | null;
	file: string | null;
}

const PLAYS_BY_ITSELF: Item['kind'][] = ['audio', 'video'];

const stillFile = (item: Item | null) => (item && !PLAYS_BY_ITSELF.includes(item.kind) ? item.path : null);

export function keepShown() {
	keepWindowState((): Shown => ({ mode: chrome.mode, folder: library.folder, file: stillFile(library.current) }));
}

export async function reopen({ mode, folder, file }: Shown) {
	chrome.mode = file ? mode : 'library';
	if (chrome.mode === 'library') library.places = await commands.places();
	if (file) return library.open(file);
	if (folder) await library.browse(folder);
}
