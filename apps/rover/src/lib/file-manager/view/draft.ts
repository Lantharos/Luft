import type { FileEntry, InlineDraft } from '$lib/types';

export const DRAFT_PATH = '\u0000draft';

export function withDraft(entries: FileEntry[], draft: InlineDraft | null): FileEntry[] {
	if (draft?.mode !== 'create') return entries;
	const folder = draft.itemType === 'folder';
	const placeholder: FileEntry = {
		name: draft.value,
		path: DRAFT_PATH,
		is_dir: folder,
		is_file: !folder,
		is_hidden: false,
		size: 0,
		modified: null,
		mime_type: null,
		extension: null
	};
	return [placeholder, ...entries];
}
