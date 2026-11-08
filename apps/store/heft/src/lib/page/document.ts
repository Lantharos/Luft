import { emptyBounds, union, type Bounds, type Stroke } from '#lib/ink/stroke.js';

export interface Change {
	removed: Stroke[];
	added: Stroke[];
}

export type ChangeListener = (dirty: Bounds, change: Change) => void;

const HISTORY_LIMIT = 500;

export class PageDocument {
	strokes: Stroke[] = [];
	revision = 0;
	onRecord: (() => void) | null = null;
	private readonly byId = new Map<string, Stroke>();
	private readonly undoStack: Change[] = [];
	private readonly redoStack: Change[] = [];
	private readonly listeners = new Set<ChangeListener>();

	constructor(private readonly persist: (change: Change) => void) {}

	get canUndo() {
		return this.undoStack.length > 0;
	}

	get canRedo() {
		return this.redoStack.length > 0;
	}

	get lastOrder() {
		return this.strokes.at(-1)?.order ?? 0;
	}

	get(id: string) {
		return this.byId.get(id);
	}

	listen(listener: ChangeListener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	/** Applies a change read back from disk: no history, nothing written. */
	replay(removed: string[], added: Stroke[]) {
		for (const id of removed) this.drop(id);
		for (const stroke of added) this.insert(stroke);
	}

	commit(change: Change) {
		if (!change.removed.length && !change.added.length) return;
		this.show(change);
		this.record(change);
	}

	/** Shows part of a change that is still being made, such as an erase in progress. */
	preview(change: Change) {
		this.show(change);
	}

	/** Keeps a change whose parts were shown with `preview`. */
	record(change: Change) {
		if (!change.removed.length && !change.added.length) return;
		this.persist(change);
		this.undoStack.push(change);
		if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
		this.redoStack.length = 0;
		this.onRecord?.();
	}

	undo() {
		const change = this.undoStack.pop();
		if (!change) return;
		this.apply({ removed: change.added, added: change.removed });
		this.redoStack.push(change);
	}

	redo() {
		const change = this.redoStack.pop();
		if (!change) return;
		this.apply(change);
		this.undoStack.push(change);
	}

	private apply(change: Change) {
		this.show(change);
		this.persist(change);
	}

	private show(change: Change) {
		const dirty = emptyBounds();
		for (const stroke of change.removed) {
			if (this.drop(stroke.id)) union(dirty, stroke.bounds);
		}
		for (const stroke of change.added) {
			this.insert(stroke);
			union(dirty, stroke.bounds);
		}
		this.revision++;
		for (const listener of this.listeners) listener(dirty, change);
	}

	private insert(stroke: Stroke) {
		const existing = this.byId.get(stroke.id);
		if (existing) this.strokes.splice(this.strokes.indexOf(existing), 1);
		this.byId.set(stroke.id, stroke);
		let index = this.strokes.length;
		while (index > 0 && this.strokes[index - 1].order > stroke.order) index--;
		this.strokes.splice(index, 0, stroke);
	}

	private drop(id: string) {
		const stroke = this.byId.get(id);
		if (!stroke) return false;
		this.byId.delete(id);
		this.strokes.splice(this.strokes.indexOf(stroke), 1);
		return true;
	}
}
