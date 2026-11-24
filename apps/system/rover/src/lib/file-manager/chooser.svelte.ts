import { appWindow } from '@lantharos/sabine';
import { join } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { ChooserConfig, FileEntry, PinnedFolder } from '#lib/bindings.js';
import { filterMatcher } from './chooser-filter';
import type { FileManager } from './manager.svelte';

const CHOOSER_ADDRESS = /^#chooser\/(\d+)$/;

export function chooserRequest() {
	const request = CHOOSER_ADDRESS.exec(location.hash)?.[1];
	return request ? Number(request) : null;
}

export class ChooserState {
	readonly config: ChooserConfig;
	#request: number;
	#manager: FileManager;
	#finished = false;
	saveName = $state('');
	filter = $state<number | null>(null);
	replacing = $state.raw<{ paths: string[]; clashes: string[] } | null>(null);

	acceptPaths = $derived.by(() => this.#acceptPaths());
	cannotSave = $derived.by(() => this.config.mode !== 'open' && !this.#targetWritable());
	canAccept = $derived(this.acceptPaths.length > 0 && !this.cannotSave);
	canMakeFolder = $derived.by(() => this.#manager.view === 'home' && this.#manager.writable);

	constructor(request: number, config: ChooserConfig, manager: FileManager) {
		this.#request = request;
		this.config = config;
		this.#manager = manager;
		this.saveName = config.currentName ?? '';
		this.filter = config.filter ?? (config.filters.length > 0 ? 0 : null);
		const matchers = config.filters.map(filterMatcher);
		manager.entryFilter = (entry) => this.filter === null || matchers[this.filter](entry);
		manager.revealCreated = (entry) => (config.mode === 'save' ? manager.navigate(entry.path) : manager.selectOnly(entry.path));
	}

	accepts = (entry: Pick<FileEntry, 'isDir'>) => {
		if (this.config.mode === 'save') return true;
		if (this.config.mode === 'save_files' || this.config.directory) return entry.isDir;
		return !entry.isDir;
	};

	select = (entry: FileEntry, event: MouseEvent) => {
		if (!this.accepts(entry) && !entry.isDir) return;
		if ((event.ctrlKey || event.metaKey) && this.config.multiple && this.accepts(entry)) {
			this.#manager.toggleSelected(entry.path);
		} else {
			this.#manager.selectOnly(entry.path);
		}
	};

	open = (entry: FileEntry) => {
		if (entry.isDir) return void this.#manager.navigate(entry.path);
		if (this.accepts(entry)) void this.submit([entry.path]);
	};

	openFavorite = (favorite: PinnedFolder) => {
		if (favorite.isDir) return void this.#manager.navigate(favorite.path);
		if (this.accepts(favorite)) void this.submit([favorite.path]);
	};

	selectRange = (paths: string[]) => {
		const wanted = new Set(paths);
		const allowed = this.#manager.entries
			.filter((entry) => wanted.has(entry.path) && this.accepts(entry))
			.map((entry) => entry.path);
		this.#manager.replaceSelection(this.config.multiple ? allowed : allowed.slice(0, 1));
	};

	selectAll = () => this.selectRange(this.#manager.displayEntries.map((entry) => entry.path));

	submit = async (paths = this.acceptPaths) => {
		if (this.#finished || paths.length === 0 || this.cannotSave) return;
		const clashes = this.config.mode === 'open' ? [] : await commands.existingPaths({ paths });
		if (clashes.length > 0) this.replacing = { paths, clashes };
		else await this.#finish(paths);
	};

	replace = (paths: string[]) => {
		this.replacing = null;
		void this.#finish(paths);
	};

	keep = () => {
		this.replacing = null;
	};

	#finish = async (paths: string[]) => {
		if (this.#finished) return;
		this.#finished = true;
		await commands
			.acceptChooser({ request: this.#request, paths, filter: this.filter })
			.catch((error) => console.error('Could not return the chosen files', error));
		await appWindow.close();
	};

	cancel = async () => {
		if (this.#finished) return;
		this.#finished = true;
		await commands.cancelChooser({ request: this.#request }).catch((error) => console.error('Could not cancel the file chooser', error));
		await appWindow.close();
	};

	#targetWritable() {
		const manager = this.#manager;
		const folder = this.config.mode === 'save_files' && manager.entries.find((entry) => entry.isDir && manager.selection.has(entry.path));
		return folder ? folder.writable : manager.writable;
	}

	#acceptPaths() {
		const manager = this.#manager;
		const folder = manager.currentPath || this.config.currentFolder || manager.homePath;
		if (this.config.mode === 'save') {
			const name = this.saveName.trim();
			return name ? [join(folder, name)] : [];
		}
		const selected = manager.entries.filter((entry) => manager.selection.has(entry.path));
		if (this.config.mode === 'save_files') {
			const target = selected.find((entry) => entry.isDir)?.path ?? manager.currentPath;
			return target ? this.config.files.map((name) => join(target, name)) : [];
		}
		const paths = selected.filter(this.accepts).map((entry) => entry.path);
		return this.config.multiple ? paths : paths.slice(0, 1);
	}
}
