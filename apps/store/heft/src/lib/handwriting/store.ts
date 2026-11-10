import { readJson, WriteQueue, writeJson } from '#lib/bridge/files.js';
import type { NotebookEntry } from '#lib/library/library.svelte.js';
import type { Box } from '#lib/search/index.svelte.js';

export interface InkLine {
	text: string;
	box: Box;
}

interface ReadPage {
	ink: string;
	lines: InkLine[];
}

interface Stored {
	format: 1;
	pages: Record<string, ReadPage>;
	changed: string[];
}

const FILE = 'handwriting.json';
const SAVE_AFTER = 1500;

class ReadText {
	private readonly notebooks = new Map<string, Promise<Stored>>();
	private readonly queues = new Map<string, WriteQueue>();
	private readonly timers = new Map<string, number>();

	private load(notebook: NotebookEntry) {
		let stored = this.notebooks.get(notebook.meta.id);
		if (!stored) {
			stored = readJson<Stored>(`${notebook.folder}/${FILE}`).then((kept) => kept ?? { format: 1, pages: {}, changed: [] });
			this.notebooks.set(notebook.meta.id, stored);
		}
		return stored;
	}

	async lines(notebook: NotebookEntry) {
		const { pages } = await this.load(notebook);
		return Object.fromEntries(Object.entries(pages).map(([page, read]) => [page, read.lines]));
	}

	async unread(notebook: NotebookEntry) {
		const { pages, changed } = await this.load(notebook);
		return notebook.meta.pages.map((page) => page.id).filter((id) => changed.includes(id) || !pages[id]);
	}

	async readWith(notebook: NotebookEntry, page: string) {
		return (await this.load(notebook)).pages[page]?.ink;
	}

	async changed(notebook: NotebookEntry, page: string) {
		const stored = await this.load(notebook);
		if (stored.changed.includes(page)) return;
		stored.changed.push(page);
		this.save(notebook);
	}

	async read(notebook: NotebookEntry, page: string, ink: string, lines: InkLine[]) {
		const stored = await this.load(notebook);
		stored.pages[page] = { ink, lines };
		stored.changed = stored.changed.filter((id) => id !== page);
		this.save(notebook);
	}

	private save(notebook: NotebookEntry) {
		const id = notebook.meta.id;
		clearTimeout(this.timers.get(id));
		this.timers.set(
			id,
			window.setTimeout(() => {
				const queue = this.queues.get(id) ?? new WriteQueue();
				this.queues.set(id, queue);
				void this.load(notebook).then((stored) => queue.run(() => writeJson(`${notebook.folder}/${FILE}`, stored)));
			}, SAVE_AFTER)
		);
	}
}

export const readText = new ReadText();

export const recognized = (notebook: NotebookEntry) => readText.lines(notebook);
