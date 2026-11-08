import { WriteQueue, writeJson } from '#lib/bridge/files.js';
import { newId } from '#lib/ink/stroke.js';
import { PageStore } from '#lib/page/storage.js';
import type { NotebookMeta, PageEntry, Paper } from './model';

const KEEP_LOADED = 24;
const SAVE_AFTER = 400;

export class OpenNotebook {
	meta: NotebookMeta = $state()!;
	readonly loaded = new Map<string, PageStore>();
	private readonly loading = new Map<string, Promise<PageStore>>();
	private readonly queue = new WriteQueue();
	private readonly undone: string[] = [];
	private readonly done: string[] = [];
	private readonly shown = new Map<string, number>();
	private saveTimer = 0;

	constructor(
		public folder: string,
		meta: NotebookMeta
	) {
		this.meta = meta;
	}

	store(id: string): PageStore | undefined {
		const store = this.loaded.get(id);
		if (store) {
			this.loaded.delete(id);
			this.loaded.set(id, store);
		}
		return store;
	}

	load(id: string): Promise<PageStore> {
		const loaded = this.store(id);
		if (loaded) return Promise.resolve(loaded);
		let pending = this.loading.get(id);
		if (!pending) {
			pending = PageStore.open(this.folder, id).then((store) => {
				this.loading.delete(id);
				store.document.onRecord = () => {
					this.done.push(id);
					this.undone.length = 0;
				};
				this.loaded.set(id, store);
				this.evict();
				return store;
			});
			this.loading.set(id, pending);
		}
		return pending;
	}

	/** Keeps a page in memory while it's on screen. */
	show(id: string) {
		this.shown.set(id, (this.shown.get(id) ?? 0) + 1);
		return () => {
			const count = (this.shown.get(id) ?? 1) - 1;
			if (count) this.shown.set(id, count);
			else this.shown.delete(id);
			this.evict();
		};
	}

	private evict() {
		for (const [id, store] of this.loaded) {
			if (this.loaded.size <= KEEP_LOADED) break;
			if (this.shown.has(id)) continue;
			this.loaded.delete(id);
			void store.compact();
		}
	}

	/** Undoes the last change on whichever page it was made. */
	undo() {
		const id = this.done.pop();
		const store = id ? this.loaded.get(id) : undefined;
		if (!id || !store?.document.canUndo) return;
		store.document.undo();
		this.undone.push(id);
	}

	redo() {
		const id = this.undone.pop();
		const store = id ? this.loaded.get(id) : undefined;
		if (!id || !store?.document.canRedo) return;
		store.document.redo();
		this.done.push(id);
	}

	addPage(at: number, paper?: Partial<Paper>): PageEntry {
		const entry: PageEntry = { id: newId(), created: Date.now(), ...(paper ? { paper } : {}) };
		this.meta.pages.splice(at, 0, entry);
		this.changed();
		return entry;
	}

	changed() {
		this.meta.modified = Date.now();
		clearTimeout(this.saveTimer);
		this.saveTimer = window.setTimeout(() => void this.save(), SAVE_AFTER);
	}

	save() {
		clearTimeout(this.saveTimer);
		const snapshot = $state.snapshot(this.meta);
		return this.queue.run(() => writeJson(`${this.folder}/notebook.json`, snapshot));
	}

	async close() {
		await this.save();
		await Promise.all([...this.loaded.values()].map((store) => store.compact()));
	}
}
