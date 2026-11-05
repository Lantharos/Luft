import type { FileEntry } from '#lib/bindings.js';
import type { InlineDraft } from '#lib/types/index.js';

export const DRAFT_PATH = '\u0000draft';

export function withDraft(entries: FileEntry[], draft: InlineDraft | null): FileEntry[] {
	if (draft?.mode !== 'create') return entries;
	const folder = draft.itemType === 'folder';
	const placeholder: FileEntry = {
		name: draft.value,
		path: DRAFT_PATH,
		isDir: folder,
		isFile: !folder,
		isHidden: false,
		size: 0,
		modified: null,
		mimeType: null,
		extension: null
	};
	return [placeholder, ...entries];
}
