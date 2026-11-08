import { readJson, writeJson } from '#lib/bridge/files.js';
import { recognized, type InkLine } from '#lib/handwriting/store.js';
import { library, type NotebookEntry } from '#lib/library/library.svelte.js';
import { pdfDocument } from '#lib/pdf/document.js';
import type { Said } from '#lib/bindings.js';
import { recordingsOf, type RecordingEntry } from '#lib/recording/model.js';
import { transcriptOf } from '#lib/recording/transcript.js';
import { sourcePath } from '#lib/pdf/sources.js';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

/** Where a page's words came from: typed, printed in a book, read from handwriting on this computer, or said in a recorded class. */
export type TextKind = 'typed' | 'book' | 'ink' | 'said';

/** Where in a recording something was said. */
export interface Moment {
	recording: string;
	at: number;
}

export interface Box {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface Hit {
	notebook: NotebookEntry;
	page: string;
	index: number;
	kind: TextKind;
	snippet: string;
	at: number;
	/** Where the hit starts in all the page's text of its kind. */
	offset: number;
	/** For handwriting, the line it was read from. */
	box?: Box;
	/** For what was said in class, when. */
	moment?: Moment;
}

interface PageText {
	page: string;
	kind: TextKind;
	text: string;
	folded: string;
	box?: Box;
	moment?: Moment;
}

const INDEX_FILE = 'search.json';
const SNIPPET = 26;
const LIMIT = 60;

/** Lower case without accents, so "jednacine" finds "jednačine". */
export const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const saidEntries = (recording: RecordingEntry, said: Said[]): PageText[] =>
	said.map((line) => ({ page: recording.page, kind: 'said', text: line.text, folded: fold(line.text), moment: { recording: recording.id, at: line.start } }));

const inkEntries = (page: string, lines: InkLine[]): PageText[] =>
	lines.filter((line) => line.text).map((line) => ({ page, kind: 'ink', text: line.text, folded: fold(line.text), box: line.box }));

/** Every notebook's words, kept in memory so search answers as you type. */
class SearchIndex {
	private readonly pages = new Map<string, PageText[]>();
	revision = $state(0);

	async load() {
		await Promise.all(library.notebooks.map((notebook) => this.loadNotebook(notebook)));
	}

	private async loadNotebook(notebook: NotebookEntry) {
		const typed = (await readJson<Record<string, string>>(`${notebook.folder}/${INDEX_FILE}`)) ?? (await this.typedText(notebook));
		const entries: PageText[] = Object.entries(typed).map(([page, text]) => ({ page, kind: 'typed', text, folded: fold(text) }));
		for (const source of new Set(notebook.meta.pages.flatMap((page) => (page.pdf ? [page.pdf.source] : [])))) {
			const book = await this.bookText(notebook, source);
			for (const page of notebook.meta.pages) {
				if (page.pdf?.source === source && book[page.pdf.index]) entries.push({ page: page.id, kind: 'book', text: book[page.pdf.index], folded: fold(book[page.pdf.index]) });
			}
		}
		for (const [page, lines] of Object.entries(await recognized(notebook))) entries.push(...inkEntries(page, lines));
		for (const recording of recordingsOf(notebook.meta)) entries.push(...saidEntries(recording, (await transcriptOf(notebook, recording)).said));
		this.pages.set(notebook.meta.id, entries);
		this.revision++;
	}

	/** What is typed on each page, read from the pages themselves when the notebook has no index yet. */
	private async typedText(notebook: NotebookEntry): Promise<Record<string, string>> {
		const open = library.openNotebook(notebook);
		const typed: Record<string, string> = {};
		for (const page of notebook.meta.pages) {
			const text = (await open.load(page.id)).document.objects.map((object) => object.text ?? '').join('\n').trim();
			if (text) typed[page.id] = text;
		}
		await writeJson(`${notebook.folder}/${INDEX_FILE}`, typed);
		return typed;
	}

	/** A book's text, pulled out once and kept beside the PDF. */
	private async bookText(notebook: NotebookEntry, source: string): Promise<string[]> {
		const file = `${notebook.folder}/sources/${source}.text.json`;
		const kept = await readJson<string[]>(file);
		if (kept) return kept;
		const document = await pdfDocument(sourcePath(notebook, source));
		const pages: string[] = [];
		for (let index = 1; index <= document.numPages; index++) {
			const content = await (await document.getPage(index)).getTextContent();
			pages.push(
				content.items
					.filter((item): item is TextItem => 'str' in item)
					.map((item) => item.str + (item.hasEOL ? '\n' : ''))
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim()
			);
		}
		await writeJson(file, pages);
		return pages;
	}

	/** Records what is typed on a page, replacing what was there. */
	setTyped(notebook: NotebookEntry, page: string, text: string) {
		const entries = (this.pages.get(notebook.meta.id) ?? []).filter((entry) => !(entry.page === page && entry.kind === 'typed'));
		if (text) entries.push({ page, kind: 'typed', text, folded: fold(text) });
		this.pages.set(notebook.meta.id, entries);
		this.revision++;
		const typed = Object.fromEntries(entries.filter((entry) => entry.kind === 'typed').map((entry) => [entry.page, entry.text]));
		return writeJson(`${notebook.folder}/${INDEX_FILE}`, typed);
	}

	/** Records the handwriting read on a page, replacing what was read there before. */
	setInk(notebook: NotebookEntry, page: string, lines: InkLine[]) {
		const entries = (this.pages.get(notebook.meta.id) ?? []).filter((entry) => !(entry.page === page && entry.kind === 'ink'));
		this.pages.set(notebook.meta.id, [...entries, ...inkEntries(page, lines)]);
		this.revision++;
	}

	/** Records what was said in a recording, replacing what was known of it. */
	setSaid(notebook: NotebookEntry, recording: RecordingEntry, said: Said[]) {
		const entries = (this.pages.get(notebook.meta.id) ?? []).filter((entry) => entry.moment?.recording !== recording.id);
		this.pages.set(notebook.meta.id, [...entries, ...saidEntries(recording, said)]);
		this.revision++;
	}

	refresh(notebook: NotebookEntry) {
		return this.loadNotebook(notebook);
	}

	search(query: string): Hit[] {
		void this.revision;
		const needle = fold(query.trim());
		if (needle.length < 2) return [];
		const hits: Hit[] = [];
		for (const notebook of library.notebooks) {
			for (const entry of this.pages.get(notebook.meta.id) ?? []) {
				const at = entry.folded.indexOf(needle);
				if (at < 0) continue;
				const index = notebook.meta.pages.findIndex((page) => page.id === entry.page);
				if (index < 0) continue;
				const start = Math.max(0, at - SNIPPET);
				const snippet = (start ? '…' : '') + entry.text.slice(start, at + needle.length + SNIPPET).trim() + (at + needle.length + SNIPPET < entry.text.length ? '…' : '');
				hits.push({ notebook, page: entry.page, index, kind: entry.kind, snippet, at: at - start + (start ? 1 : 0), offset: at, box: entry.box, moment: entry.moment });
				if (hits.length >= LIMIT) return hits;
			}
		}
		return hits;
	}
}

export const searchIndex = new SearchIndex();
