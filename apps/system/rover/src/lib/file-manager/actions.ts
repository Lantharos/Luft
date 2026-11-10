import { appWindow } from '@lantharos/sabine';
import { basename, isInside, join, parent } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { dialogs } from '#lib/features/dialogs.svelte.js';
import { offeredFiles, offerFiles } from './clipboard';
import type { FileManager } from './manager.svelte';

export class FileActions {
	#manager: FileManager;

	constructor(manager: FileManager) {
		this.#manager = manager;
	}

	closeWindow = () => {
		const working = this.#manager.operations.some((operation) => operation.completedAt === null);
		if (working) dialogs.stillWorking();
		else void appWindow.close();
	};

	extractNextTo = async (path: string) => {
		const manager = this.#manager;
		await commands.extractArchives({ paths: [path], destination: parent(path) }).then(manager.selectWhenDone, manager.notify);
	};

	copy = () => this.#offer('copy');

	cut = () => this.#offer('cut');

	paste = async () => {
		const manager = this.#manager;
		const carried = await offeredFiles();
		if (!carried || manager.view !== 'home') return;
		const destination = manager.currentPath;
		await this.transfer(carried.paths, destination, carried.move);
		if (!carried.move) return;
		manager.clipboard = { items: [], operation: null };
		await offerFiles(carried.paths.map((path) => join(destination, basename(path))), false).catch(manager.notify);
	};

	watchClipboard = async () => {
		const manager = this.#manager;
		const carried = await offeredFiles();
		manager.canPaste = carried !== null;
		const cutting = manager.clipboard.items.map((item) => item.path);
		const stillCutting = carried?.move && carried.paths.length === cutting.length && carried.paths.every((path) => cutting.includes(path));
		if (manager.clipboard.operation === 'cut' && !stillCutting) manager.clipboard = { items: [], operation: null };
	};

	transfer = async (sources: string[], destination: string, move: boolean) => {
		const manager = this.#manager;
		if (sources.length === 0 || sources.some((source) => isInside(destination, source))) return;
		if (move && sources.every((source) => parent(source) === destination)) return;
		try {
			if (move) {
				await commands.moveItems({ sources, destination });
				if (destination !== manager.currentPath) this.#hideEntries(sources);
			} else {
				await commands.copyItems({ sources, destination });
			}
		} catch (caught) {
			manager.notify(caught);
		}
	};

	trashSelected = async () => {
		const manager = this.#manager;
		const selected = [...manager.selection];
		if (selected.length === 0) return;
		if (manager.view === 'trash') return dialogs.deleteForever(selected);
		await this.trash(selected);
	};

	deleteForever = async (ids: string[]) => {
		await commands.deletePermanently({ ids }).catch(this.#manager.notify);
		await this.#manager.loadTrash();
	};

	deleteItems = async (paths: string[]) => {
		const manager = this.#manager;
		const previous = manager.entries;
		this.#hideEntries(paths);
		await commands.deleteItems({ paths }).catch((caught) => {
			manager.entries = previous;
			manager.notify(caught);
		});
	};

	trash = async (all: string[]) => {
		const manager = this.#manager;
		const withoutTrash = all.filter((path) => manager.cloud.holding(path));
		if (withoutTrash.length > 0) dialogs.deleteItems(withoutTrash);
		const paths = all.filter((path) => !withoutTrash.includes(path));
		if (paths.length === 0) return;
		const previous = manager.entries;
		this.#hideEntries(paths);
		try {
			await commands.moveToTrash({ paths });
			if (manager.view === 'trash') await manager.loadTrash();
		} catch (caught) {
			manager.entries = previous;
			manager.notify(caught);
		}
	};

	restoreTrash = async (ids: string[]) => {
		if (ids.length === 0) return;
		await commands.restoreFromTrash({ ids }).catch(this.#manager.notify);
		await this.#manager.loadTrash();
	};

	emptyTrash = async (trashPath: string | null) => {
		await commands.emptyTrash({ trashPath }).catch(this.#manager.notify);
		if (this.#manager.view === 'trash') await this.#manager.loadTrash();
	};

	#offer(operation: 'copy' | 'cut') {
		const manager = this.#manager;
		const items = manager.selectedEntries;
		if (items.length === 0) return;
		manager.clipboard = { items, operation };
		manager.canPaste = true;
		offerFiles(items.map((item) => item.path), operation === 'cut').catch(manager.notify);
	}

	#hideEntries(paths: string[]) {
		const manager = this.#manager;
		const hidden = new Set(paths);
		manager.entries = manager.entries.filter((entry) => !hidden.has(entry.path));
		for (const path of paths) manager.selection.delete(path);
	}
}
