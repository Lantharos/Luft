import { thumbnails } from '$lib/features/thumbnails.svelte';
import type { FileEntry } from '$lib/types';
import { mayBeTransparent } from '$lib/utils/file-kinds';

export function thumbnailOf(entry: FileEntry) {
	return { thumbnail: thumbnails.source(entry), backdrop: mayBeTransparent(entry) };
}
