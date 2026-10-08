import { countColumn } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import { tick } from 'svelte';
import type { Backend } from '#lib/bridge/types.js';
import { Editor } from '#lib/editor/editor.js';
import { FolderTree } from '#lib/files/tree.svelte.js';
import type { SettingsStore } from '#lib/app/settings.svelte.js';
import { Backups } from './backups';
import { Document } from './document.svelte';

export interface CursorStatus {
	line: number;
	column: number;
	selections: number;
	selected: number;
}

export interface CloseRequest {
	documents: Document[];
	resolve: (confirmed: boolean) => void;
}

const START_CURSOR: CursorStatus = { line: 1, column: 1, selections: 1, selected: 0 };

export class Workspace {
	readonly backend: Backend;
	readonly settings: SettingsStore;
	readonly editor: Editor;
	readonly tree: FolderTree;
	readonly backups: Backups;
	documents = $state<Document[]>([]);
	active = $state<Document | null>(null);
	cursor = $state.raw<CursorStatus>(START_CURSOR);
	revision = $state(0);
	notice = $state<string | null>(null);
	closeRequest = $state<CloseRequest | null>(null);
	browsing = $state(true);
	home = '';
	#onchange: () => void;

	constructor(backend: Backend, settings: SettingsStore, onchange: () => void) {
		this.backend = backend;
		this.settings = settings;
		this.#onchange = onchange;
		this.editor = new Editor(settings.value.wrap, (document, update) => this.#updated(document, update));
		this.tree = new FolderTree(backend, onchange);
		this.backups = new Backups(this);
	}

	#updated(document: Document, update: ViewUpdate) {
		if (update.docChanged) {
			this.refreshDirty(document);
			this.backups.schedule(document);
			if (document === this.active) this.revision++;
		}
		if (document === this.active && (update.docChanged || update.selectionSet)) {
			this.#measureCursor(update.state);
			this.#onchange();
		}
	}

	#measureCursor(state: ViewUpdate['state']) {
		const { main, ranges } = state.selection;
		const line = state.doc.lineAt(main.head);
		this.cursor = {
			line: line.number,
			column: countColumn(line.text.slice(0, main.head - line.from), state.tabSize) + 1,
			selections: ranges.length,
			selected: ranges.reduce((total, range) => total + range.to - range.from, 0)
		};
	}

	refreshDirty(document: Document) {
		const dirty = document.format !== document.savedFormat || !this.editor.state(document).doc.eq(document.saved);
		if (dirty !== document.dirty) document.dirty = dirty;
	}

	showFolder(path: string, expanded: string[] = []) {
		this.browsing = true;
		return this.tree.open(path, expanded);
	}

	find(path: string) {
		return this.documents.find((document) => document.path === path) ?? null;
	}

	activate(document: Document | null, focus = true) {
		this.active = document;
		this.editor.show(document);
		if (document) {
			this.#measureCursor(this.editor.state(document));
			if (focus) void tick().then(() => this.editor.focus());
		}
		this.revision++;
		this.#onchange();
	}

	add(document: Document, activate = true) {
		const index = this.active ? this.documents.indexOf(this.active) + 1 : this.documents.length;
		this.documents.splice(index, 0, document);
		if (activate) this.activate(document);
		else this.#onchange();
	}

	cycle(step: number) {
		if (!this.active || this.documents.length < 2) return;
		const index = this.documents.indexOf(this.active);
		this.activate(this.documents[(index + step + this.documents.length) % this.documents.length]);
	}

	move(document: Document, index: number) {
		const from = this.documents.indexOf(document);
		if (from < 0 || from === index) return;
		this.documents.splice(from, 1);
		this.documents.splice(index, 0, document);
		this.#onchange();
	}

	remove(document: Document) {
		const index = this.documents.indexOf(document);
		if (index < 0) return;
		this.documents.splice(index, 1);
		void this.backups.remove(document);
		if (this.active === document) this.activate(this.documents[Math.min(index, this.documents.length - 1)] ?? null);
		else this.#onchange();
	}

	confirmClose(documents: Document[]) {
		const dirty = documents.filter((document) => document.dirty);
		if (!dirty.length) return Promise.resolve(true);
		this.closeRequest?.resolve(false);
		return new Promise<boolean>((resolve) => {
			this.closeRequest = {
				documents: dirty,
				resolve: (confirmed) => {
					this.closeRequest = null;
					resolve(confirmed);
				}
			};
		});
	}

	async close(document: Document) {
		if (await this.confirmClose([document])) this.remove(document);
	}

	async closeOthers(keep: Document) {
		const others = this.documents.filter((document) => document !== keep);
		if (await this.confirmClose(others)) others.forEach((document) => this.remove(document));
	}

	report(error: unknown) {
		this.notice = error instanceof Error ? error.message : String(error);
	}

	changed() {
		this.#onchange();
	}
}
