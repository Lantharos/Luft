const MERGE_MS = 900;
const LIMIT = 200;

export class History<T> {
	canUndo = $state(false);
	canRedo = $state(false);

	#past: T[] = [];
	#future: T[] = [];
	#lastKey = '';
	#lastAt = 0;

	record(before: T, key: string) {
		const now = performance.now();
		const merges = key === this.#lastKey && now - this.#lastAt < MERGE_MS;
		this.#lastKey = key;
		this.#lastAt = now;
		if (merges && this.#past.length) return;
		this.#past.push(before);
		if (this.#past.length > LIMIT) this.#past.shift();
		this.#future = [];
		this.#update();
	}

	undo(current: T): T | null {
		const previous = this.#past.pop();
		if (previous === undefined) return null;
		this.#future.push(current);
		this.#lastKey = '';
		this.#update();
		return previous;
	}

	redo(current: T): T | null {
		const next = this.#future.pop();
		if (next === undefined) return null;
		this.#past.push(current);
		this.#lastKey = '';
		this.#update();
		return next;
	}

	#update() {
		this.canUndo = this.#past.length > 0;
		this.canRedo = this.#future.length > 0;
	}
}

export interface Undoable {
	readonly history: { canUndo: boolean; canRedo: boolean };
	undo(): void;
	redo(): void;
}

export function undoShortcuts(target: Undoable) {
	return (event: KeyboardEvent) => {
		if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
		if (event.target instanceof HTMLElement && event.target.closest('[data-own-undo]')) return;
		const key = event.key.toLowerCase();
		if (key === 'z' && !event.shiftKey) target.undo();
		else if ((key === 'z' && event.shiftKey) || key === 'y') target.redo();
		else return;
		event.preventDefault();
	};
}
