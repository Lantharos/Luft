import { join } from '#lib/utils/paths.js';
import { textChunks } from './chunks';
import type { Document } from './document.svelte';
import type { Workspace } from './workspace.svelte';

const DELAY_MS = 1200;
const LIMIT_CHARS = 8 * 1024 * 1024;

export class Backups {
	folder = '';
	#workspace: Workspace;
	#pending = new Map<Document, ReturnType<typeof setTimeout>>();

	constructor(workspace: Workspace) {
		this.#workspace = workspace;
	}

	preserves(document: Document) {
		return this.#workspace.editor.state(document).doc.length <= LIMIT_CHARS;
	}

	schedule(document: Document) {
		clearTimeout(this.#pending.get(document));
		this.#pending.set(
			document,
			setTimeout(() => void this.#settle(document), DELAY_MS)
		);
	}

	async flush() {
		const pending = [...this.#pending.keys()];
		pending.forEach((document) => clearTimeout(this.#pending.get(document)));
		await Promise.all(pending.map((document) => this.#settle(document)));
	}

	async remove(document: Document) {
		clearTimeout(this.#pending.get(document));
		this.#pending.delete(document);
		if (!document.backup) return;
		const name = document.backup;
		document.backup = null;
		await this.#workspace.backend.removeBackup(name).catch(() => {});
		this.#workspace.changed();
	}

	path(name: string) {
		return join(this.folder, name);
	}

	async #settle(document: Document) {
		this.#pending.delete(document);
		if (!document.dirty || !this.preserves(document) || !this.#workspace.documents.includes(document)) return this.remove(document);
		const name = `${document.id}.txt`;
		const text = this.#workspace.editor.state(document).doc;
		await this.#workspace.backend.write(textChunks(text, '\n'), { path: this.path(name), encoding: 'utf-8', bom: false });
		if (document.backup !== name) {
			document.backup = name;
			this.#workspace.changed();
		}
	}
}
