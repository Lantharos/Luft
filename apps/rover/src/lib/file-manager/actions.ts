import * as api from '$lib/api';
import { closeWindow } from '$lib/runtime';
import { settings } from '$lib/state/settings.svelte';
import type { FileEntry } from '$lib/types';
import { isInside, parentPath } from '$lib/utils/paths';
import type { FileManager } from './manager.svelte';

export class FileActions {
	#manager: FileManager;

	constructor(manager: FileManager) {
		this.#manager = manager;
	}

	closeWindow = () => closeWindow();

	copy = () => {
		const items = this.#manager.selectedEntries;
		if (items.length > 0) this.#manager.clipboard = { items, operation: 'copy' };
	};

	cut = () => {
		const items = this.#manager.selectedEntries;
		if (items.length > 0) this.#manager.clipboard = { items, operation: 'cut' };
	};

	paste = async () => {
		const { items, operation } = this.#manager.clipboard;
		if (!operation || items.length === 0) return;
		const paths = items.map((item) => item.path);
		if (operation === 'cut') this.#manager.clipboard = { items: [], operation: null };
		await this.transfer(paths, this.#manager.currentPath, operation === 'cut');
	};

	transfer = async (sources: string[], destination: string, move: boolean) => {
		const manager = this.#manager;
		if (sources.length === 0 || sources.some((source) => isInside(destination, source))) return;
		if (move && sources.every((source) => parentPath(source) === destination)) return;
		try {
			if (move) {
				await api.moveItems(sources, destination);
				if (destination !== manager.currentPath) this.#hideEntries(sources);
			} else {
				await api.copyItems(sources, destination);
			}
		} catch (caught) {
			manager.notify(caught);
		}
	};

	trashSelected = async () => {
		const manager = this.#manager;
		const selected = [...manager.selection];
		if (selected.length === 0) return;
		if (manager.view === 'trash') {
			await api.deletePermanently(selected).catch(manager.notify);
			await manager.loadTrash();
			return;
		}
		await this.trash(selected);
	};

	trash = async (paths: string[]) => {
		const manager = this.#manager;
		if (paths.length === 0) return;
		const previous = manager.entries;
		this.#hideEntries(paths);
		try {
			await api.moveToTrash(paths);
			if (manager.view === 'trash') await manager.loadTrash();
		} catch (caught) {
			manager.entries = previous;
			manager.notify(caught);
		}
	};

	restoreTrash = async (ids: string[]) => {
		if (ids.length === 0) return;
		await api.restoreFromTrash(ids).catch(this.#manager.notify);
		await this.#manager.loadTrash();
	};

	emptyTrash = async (trashPath: string | null) => {
		await api.emptyTrash(trashPath).catch(this.#manager.notify);
		await this.#manager.loadTrash();
	};

	toggleFavorite = (entry: FileEntry) => {
		settings.update((current) => {
			const others = current.favorites.filter((favorite) => favorite.path !== entry.path);
			const exists = others.length !== current.favorites.length;
			return {
				...current,
				favorites: exists ? others : [{ name: entry.name, path: entry.path, is_dir: entry.is_dir }, ...others]
			};
		});
	};

	#hideEntries(paths: string[]) {
		const manager = this.#manager;
		const hidden = new Set(paths);
		manager.entries = manager.entries.filter((entry) => !hidden.has(entry.path));
		for (const path of paths) manager.selection.delete(path);
	}
}
