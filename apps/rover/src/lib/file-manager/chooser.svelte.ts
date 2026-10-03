import * as api from '#lib/api.js';
import type { ChooserConfig, FileEntry, PinnedFolder } from '#lib/types/index.js';
import { joinPath } from '#lib/utils/paths.js';
import type { FileManager } from './manager.svelte';

export class ChooserState {
	readonly config: ChooserConfig;
	#manager: FileManager;
	#finished = false;
	saveName = $state('');

	acceptPaths = $derived.by(() => this.#acceptPaths());
	canAccept = $derived(this.acceptPaths.length > 0);

	constructor(config: ChooserConfig, manager: FileManager) {
		this.config = config;
		this.#manager = manager;
		this.saveName = config.current_name ?? '';
	}

	accepts = (entry: Pick<FileEntry, 'is_dir'>) => {
		if (this.config.mode === 'save') return true;
		if (this.config.mode === 'save_files' || this.config.directory) return entry.is_dir;
		return !entry.is_dir;
	};

	select = (entry: FileEntry, event: MouseEvent) => {
		if (!this.accepts(entry) && !entry.is_dir) return;
		if ((event.ctrlKey || event.metaKey) && this.config.multiple && this.accepts(entry)) {
			this.#manager.toggleSelected(entry.path);
		} else {
			this.#manager.selectOnly(entry.path);
		}
	};

	open = (entry: FileEntry) => {
		if (entry.is_dir) return void this.#manager.navigate(entry.path);
		if (this.accepts(entry)) void this.submit([entry.path]);
	};

	openFavorite = (favorite: PinnedFolder) => {
		if (favorite.is_dir) return void this.#manager.navigate(favorite.path);
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
		if (this.#finished || paths.length === 0) return;
		this.#finished = true;
		await api.acceptChooser(paths).catch((error) => console.error('Could not return the chosen files', error));
	};

	cancel = async () => {
		if (this.#finished) return;
		this.#finished = true;
		await api.cancelChooser().catch((error) => console.error('Could not cancel the file chooser', error));
	};

	#acceptPaths() {
		const manager = this.#manager;
		const folder = manager.currentPath || this.config.current_folder || manager.homePath;
		if (this.config.mode === 'save') {
			const name = this.saveName.trim();
			return name ? [joinPath(folder, name)] : [];
		}
		const selected = manager.entries.filter((entry) => manager.selection.has(entry.path));
		if (this.config.mode === 'save_files') {
			const target = selected.find((entry) => entry.is_dir)?.path ?? manager.currentPath;
			return target ? this.config.files.map((name) => joinPath(target, name)) : [];
		}
		const paths = selected.filter(this.accepts).map((entry) => entry.path);
		return this.config.multiple ? paths : paths.slice(0, 1);
	}
}
