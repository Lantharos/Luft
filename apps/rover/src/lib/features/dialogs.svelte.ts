import type { FileEntry } from '$lib/types';

export type OpenDialog =
	| { kind: 'properties'; entries: FileEntry[] }
	| { kind: 'rename'; entries: FileEntry[] }
	| { kind: 'compress'; entries: FileEntry[]; destination: string }
	| { kind: 'empty-trash'; trashPath: string | null; emptied?: () => void };

class Dialogs {
	current = $state.raw<OpenDialog | null>(null);

	properties = (entries: FileEntry[]) => this.#open({ kind: 'properties', entries });

	rename = (entries: FileEntry[]) => this.#open({ kind: 'rename', entries });

	compress = (entries: FileEntry[], destination: string) => this.#open({ kind: 'compress', entries, destination });

	emptyTrash = (trashPath: string | null, emptied?: () => void) => {
		this.current = { kind: 'empty-trash', trashPath, emptied };
	};

	close = () => {
		this.current = null;
	};

	#open(dialog: Exclude<OpenDialog, { kind: 'empty-trash' }>) {
		if (dialog.entries.length > 0) this.current = dialog;
	}
}

export const dialogs = new Dialogs();
