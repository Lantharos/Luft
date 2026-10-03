import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { Backend, Entry } from '#lib/bridge/types.js';
import { dirname, isInside } from '#lib/utils/paths.js';

export interface TreeRow {
	entry: Entry;
	depth: number;
	expanded: boolean;
}

export class FolderTree {
	root = $state<string | null>(null);
	expanded = new SvelteSet<string>();
	#listings = new SvelteMap<string, Entry[]>();
	#backend: Backend;
	#onchange: () => void;

	rows = $derived.by(() => {
		const rows: TreeRow[] = [];
		const visit = (folder: string, depth: number) => {
			for (const entry of this.#listings.get(folder) ?? []) {
				const expanded = entry.folder && this.expanded.has(entry.path);
				rows.push({ entry, depth, expanded });
				if (expanded) visit(entry.path, depth + 1);
			}
		};
		if (this.root) visit(this.root, 0);
		return rows;
	});

	constructor(backend: Backend, onchange: () => void) {
		this.#backend = backend;
		this.#onchange = onchange;
	}

	get folders() {
		return this.root ? [this.root, ...this.expanded] : [];
	}

	async open(root: string, expanded: string[] = []) {
		this.root = root;
		this.#listings.clear();
		this.expanded.clear();
		await this.#load(root);
		await Promise.all(expanded.filter((path) => isInside(path, root)).map((path) => this.#expand(path)));
		this.#onchange();
	}

	close() {
		this.root = null;
		this.#listings.clear();
		this.expanded.clear();
		this.#onchange();
	}

	async toggle(path: string) {
		if (this.expanded.delete(path)) {
			for (const nested of this.expanded) if (isInside(nested, path)) this.expanded.delete(nested);
		} else {
			await this.#expand(path);
		}
		this.#onchange();
	}

	collapseAll() {
		this.expanded.clear();
		this.#onchange();
	}

	async reveal(path: string) {
		if (!this.root || !isInside(path, this.root)) return;
		const ancestors: string[] = [];
		for (let folder = dirname(path); folder !== this.root && isInside(folder, this.root); folder = dirname(folder)) ancestors.unshift(folder);
		for (const folder of ancestors) if (!this.expanded.has(folder)) await this.#expand(folder);
		this.#onchange();
	}

	async refresh(paths: string[]) {
		const folders = new Set(paths.flatMap((path) => [path, dirname(path)]).filter((folder) => this.#listings.has(folder)));
		await Promise.all([...folders].map((folder) => this.#load(folder)));
	}

	async #expand(path: string) {
		this.expanded.add(path);
		if (!this.#listings.has(path)) await this.#load(path);
	}

	async #load(folder: string) {
		const entries = await this.#backend.list(folder).catch(() => null);
		if (entries) this.#listings.set(folder, entries);
		else {
			this.#listings.delete(folder);
			this.expanded.delete(folder);
		}
	}
}
