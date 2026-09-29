import type { Backend } from '$lib/bridge/types';

export interface IndexedFile {
	path: string;
	relative: string;
	lowered: string;
	nameStart: number;
}

export class FileIndex {
	files = $state.raw<IndexedFile[]>([]);
	#root: string | null = null;
	#stale = true;
	#backend: Backend;

	constructor(backend: Backend) {
		this.#backend = backend;
	}

	invalidate() {
		this.#stale = true;
	}

	async refresh(root: string | null) {
		if (root !== this.#root) {
			this.#root = root;
			this.files = [];
			this.#stale = true;
		}
		if (!root || !this.#stale) return;
		this.#stale = false;
		const { files } = await this.#backend.index(root);
		if (root !== this.#root) return;
		this.files = files.map((relative) => ({
			path: `${root}/${relative}`,
			relative,
			lowered: relative.toLowerCase(),
			nameStart: relative.lastIndexOf('/') + 1
		}));
	}
}
