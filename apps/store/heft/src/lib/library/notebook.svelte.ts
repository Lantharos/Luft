import { recent } from '#lib/app/recent.svelte.js';
import { readFile, replaceFile, WriteQueue, writeJson } from '#lib/bridge/files.js';
import { commands } from '#lib/bindings.js';
import { newId } from '#lib/ink/stroke.js';
import { SvelteMap } from 'svelte/reactivity';
import { PageStore } from '#lib/page/storage.js';
import { searchIndex } from '#lib/search/index.svelte.js';
import type { NotebookEntry } from './library.svelte';
import type { NotebookMeta, PageEntry, Paper } from './model';

const KEEP_LOADED = 24;
const SAVE_AFTER = 400;

/** A notebook whose pages are being read or written, kept for as long as Heft runs. */
export class OpenNotebook {
	readonly loaded = new Map<string, PageStore>();
	/** How many times each page changed since Heft started, for whatever shows it small. */
	readonly revisions = new SvelteMap<string, number>();
	private readonly loading = new Map<string, Promise<PageStore>>();
	private readonly queue = new WriteQueue();
	private readonly undone: string[] = [];
	private readonly done: string[] = [];
	private readonly shown = new Map<string, number>();
	private saveTimer = 0;

	constructor(readonly entry: NotebookEntry) {}

	get meta(): NotebookMeta {
		return this.entry.meta;
	}

	get folder() {
		return this.entry.folder;
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
			pending = PageStore.open(() => this.folder, id).then((store) => {
				this.loading.delete(id);
				store.document.onRecord = () => {
					recent.touch(this.meta.id, id);
					this.done.push(id);
					this.undone.length = 0;
				};
				store.document.listen((_, change) => {
					this.revisions.set(id, (this.revisions.get(id) ?? 0) + 1);
					if (change.objects) void searchIndex.setTyped(this.entry, id, store.document.objects.map((object) => object.text ?? '').join('\n').trim());
				});
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

	indexOf(id: string) {
		return this.meta.pages.findIndex((page) => page.id === id);
	}

	addPage(at: number, paper?: Partial<Paper>): PageEntry {
		const entry: PageEntry = { id: newId(), created: Date.now(), ...(paper ? { paper } : {}) };
		this.meta.pages.splice(at, 0, entry);
		this.changed();
		return entry;
	}

	async duplicatePage(index: number): Promise<PageEntry> {
		const source = this.meta.pages[index];
		await (await this.load(source.id)).compact(true);
		const copy: PageEntry = { ...$state.snapshot(source), id: newId(), created: Date.now() };
		await replaceFile(`${this.folder}/pages/${copy.id}.page`, await readFile(`${this.folder}/pages/${source.id}.page`));
		this.meta.pages.splice(index + 1, 0, copy);
		this.changed();
		return copy;
	}

	trashPage(index: number) {
		const [page] = this.meta.pages.splice(index, 1);
		this.meta.trashed = [...(this.meta.trashed ?? []), { page, index, at: Date.now() }];
		this.meta.sections = this.meta.sections.filter((section) => section.page !== page.id);
		if (!this.meta.pages.length) this.addPage(0);
		this.changed();
	}

	restorePage(id: string) {
		const trashed = this.meta.trashed?.find((item) => item.page.id === id);
		if (!trashed) return;
		this.meta.trashed = this.meta.trashed!.filter((item) => item !== trashed);
		this.meta.pages.splice(Math.min(trashed.index, this.meta.pages.length), 0, trashed.page);
		this.changed();
	}

	movePage(from: number, to: number) {
		const [page] = this.meta.pages.splice(from, 1);
		this.meta.pages.splice(to > from ? to - 1 : to, 0, page);
		this.changed();
	}

	/** Moves a page with its ink to another notebook. */
	async sendPage(index: number, target: OpenNotebook, at = target.meta.pages.length) {
		const page = this.meta.pages[index];
		const store = await this.load(page.id);
		await store.compact(true);
		this.loaded.delete(page.id);
		await commands.rename({ from: `${this.folder}/pages/${page.id}.page`, to: `${target.folder}/pages/${page.id}.page` });
		await commands.remove({ path: `${this.folder}/pages/${page.id}.journal` });
		this.meta.pages.splice(index, 1);
		this.meta.sections = this.meta.sections.filter((section) => section.page !== page.id);
		if (!this.meta.pages.length) this.addPage(0);
		target.meta.pages.splice(at, 0, page);
		this.changed();
		target.changed();
	}

	addSection(page: string, title: string) {
		this.meta.sections = [...this.meta.sections.filter((section) => section.page !== page), { id: newId(), title, page }];
		this.changed();
	}

	renameSection(id: string, title: string) {
		const section = this.meta.sections.find((candidate) => candidate.id === id);
		if (section) section.title = title;
		this.changed();
	}

	removeSection(id: string) {
		this.meta.sections = this.meta.sections.filter((section) => section.id !== id);
		this.changed();
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

	/** Writes everything still pending, so the notebook's folder can move. */
	async settle() {
		await this.save();
		await Promise.all([...this.loaded.values()].map((store) => store.compact()));
	}

	drop() {
		clearTimeout(this.saveTimer);
		this.loaded.clear();
	}
}
