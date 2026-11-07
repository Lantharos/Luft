import type { FileEntry } from '#lib/bindings.js';
import { folderLooks } from '#lib/features/looks/looks.svelte.js';
import { thumbnails } from '#lib/features/onscreen/thumbnails.svelte.js';
import { isAppBundle, mayBeTransparent } from '#lib/utils/kinds.js';

export function entryArt(entry: FileEntry) {
	if (entry.isDir) return folderLooks.of(entry);
	return { thumbnail: thumbnails.source(entry), backdrop: mayBeTransparent(entry), app: isAppBundle(entry) };
}
