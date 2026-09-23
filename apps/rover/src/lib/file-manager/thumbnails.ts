import type { FileEntry } from '$lib/types';
import { isImagePath } from '$lib/utils';

const MAX_DIRECTORY_THUMBNAILS = 80;

export function canThumbnail(entry: FileEntry) {
	return entry.is_file && (entry.mime_type?.startsWith('image/') || isImagePath(entry.name));
}

export function thumbnailCandidates(entries: FileEntry[]) {
	return entries.filter(canThumbnail).slice(0, MAX_DIRECTORY_THUMBNAILS);
}
