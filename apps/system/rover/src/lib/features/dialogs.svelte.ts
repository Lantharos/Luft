import type { FileEntry } from '#lib/bindings.js';


export type OpenDialog =
	| { kind: 'properties'; entries: FileEntry[] }
	| { kind: 'rename'; entries: FileEntry[] }
	| { kind: 'compress'; entries: FileEntry[]; destination: string }
	| { kind: 'look'; entries: FileEntry[] }
	| { kind: 'empty-trash'; trashPath: string | null }
	| { kind: 'delete-forever'; ids: string[] }
	| { kind: 'connect' };

class Dialogs {
	current = $state.raw<OpenDialog | null>(null);

	properties = (entries: FileEntry[]) => this.#open({ kind: 'properties', entries });

	rename = (entries: FileEntry[]) => this.#open({ kind: 'rename', entries });

	compress = (entries: FileEntry[], destination: string) => this.#open({ kind: 'compress', entries, destination });

	look = (entries: FileEntry[]) => this.#open({ kind: 'look', entries });

	emptyTrash = (trashPath: string | null) => {
		this.current = { kind: 'empty-trash', trashPath };
	};

	deleteForever = (ids: string[]) => {
		this.current = { kind: 'delete-forever', ids };
	};

	connect = () => {
		this.current = { kind: 'connect' };
	};

	close = () => {
		this.current = null;
	};

	#open(dialog: Extract<OpenDialog, { entries: FileEntry[] }>) {
		if (dialog.entries.length > 0) this.current = dialog;
	}
}

export const dialogs = new Dialogs();
