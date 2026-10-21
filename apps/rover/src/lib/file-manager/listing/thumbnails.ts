import { thumbnails } from '#lib/features/onscreen/thumbnails.svelte.js';
import type { FileEntry } from '#lib/types/index.js';
import { isAppBundle, mayBeTransparent } from '#lib/utils/kinds.js';

export function thumbnailOf(entry: FileEntry) {
	return { thumbnail: thumbnails.source(entry), backdrop: mayBeTransparent(entry), app: isAppBundle(entry) };
}
