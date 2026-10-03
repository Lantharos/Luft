import type { FileEntry } from '#lib/types/index.js';

const RESET_MS = 900;

export class TypeSelect {
	#buffer = '';
	#typedAt = 0;

	get active() {
		return this.#buffer.length > 0 && performance.now() - this.#typedAt < RESET_MS;
	}

	find(character: string, entries: FileEntry[], cursorIndex: number) {
		this.#buffer = (this.active ? this.#buffer : '') + character.toLowerCase();
		this.#typedAt = performance.now();
		const repeating = [...this.#buffer].every((typed) => typed === this.#buffer[0]);
		const prefix = repeating ? this.#buffer[0] : this.#buffer;
		const from = repeating && this.#buffer.length > 1 ? cursorIndex + 1 : 0;
		const matches = (entry: FileEntry) => entry.name.toLowerCase().startsWith(prefix);
		const after = entries.findIndex((entry, index) => index >= from && matches(entry));
		return after !== -1 ? after : entries.findIndex(matches);
	}
}
