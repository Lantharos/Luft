import { SvelteMap } from 'svelte/reactivity';
import * as api from '$lib/api';
import { isDesktopRuntime } from '$lib/runtime';
import { settings } from '$lib/state/settings.svelte';
import type { FileEntry } from '$lib/types';
import { isInside, pathSegments } from '$lib/utils/paths';
import { sortedEntries } from '../listing/entries';
import type { FileManager } from '../manager.svelte';
import { previewEntries } from '../preview';

export type FolderColumnModel = {
	path: string;
	current: boolean;
	trail: string | null;
};

export class ColumnsData {
	#listings = new SvelteMap<string, FileEntry[]>();
	#requested = new Set<string>();
	#hidden = settings.value.showHidden;

	root: string;
	preview: string | null;
	columns: FolderColumnModel[];

	constructor(manager: FileManager) {
		this.root = $derived(isInside(manager.currentPath, manager.homePath) ? manager.homePath : '/');
		this.preview = $derived.by(() => {
			if (manager.selection.size !== 1) return null;
			const [path] = manager.selection;
			return manager.entries.find((entry) => entry.path === path && entry.is_dir)?.path ?? null;
		});
		this.columns = $derived.by(() => {
			const current = manager.currentPath;
			const nested = pathSegments(current).map((segment) => segment.path).filter((path) => path.length > this.root.length);
			const ancestors = [this.root, ...nested];
			const columns: FolderColumnModel[] = ancestors.map((path, index) => ({
				path,
				current: path === current,
				trail: ancestors[index + 1] ?? (path === current ? this.preview : null)
			}));
			if (this.preview) columns.push({ path: this.preview, current: false, trail: null });
			return columns;
		});
	}

	entries(path: string) {
		const listing = this.#listings.get(path);
		return listing ? sortedEntries(listing, settings.value.sortBy, settings.value.sortAsc) : [];
	}

	load = (paths: string[]) => {
		if (this.#hidden !== settings.value.showHidden) this.#forget();
		for (const path of paths) {
			if (this.#requested.has(path)) continue;
			this.#requested.add(path);
			void this.#fetch(path).then((entries) => this.#listings.set(path, entries));
		}
	};

	#forget() {
		this.#hidden = settings.value.showHidden;
		this.#requested.clear();
		this.#listings.clear();
	}

	async #fetch(path: string) {
		if (!isDesktopRuntime()) return previewEntries(path);
		const listing = await api.listDirectory(path, settings.value.showHidden).catch(() => null);
		return listing?.entries ?? [];
	}
}
