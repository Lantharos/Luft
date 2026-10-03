import { thumbnails } from '#lib/features/onscreen/thumbnails.svelte.js';
import type { FileEntry } from '#lib/types/index.js';
import { mayBeTransparent } from '#lib/utils/file-kinds.js';

export function thumbnailOf(entry: FileEntry) {
	return { thumbnail: thumbnails.source(entry), backdrop: mayBeTransparent(entry) };
}
