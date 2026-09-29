import { thumbnails } from '$lib/features/thumbnails.svelte';
import type { FileEntry } from '$lib/types';

export function thumbnailSource(entry: FileEntry) {
	return thumbnails.source(entry);
}
