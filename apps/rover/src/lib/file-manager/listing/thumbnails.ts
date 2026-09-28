import { localFileSource } from '$lib/runtime';
import type { FileEntry } from '$lib/types';
import { isImage } from '$lib/utils/file-kinds';

export function thumbnailSource(entry: FileEntry) {
	return entry.is_file && isImage(entry) ? localFileSource(entry.path, entry.modified) : null;
}
