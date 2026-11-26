import { History } from '#lib/document/history.svelte.js';
import { bounds, union } from './geometry';
import type { BoardObject, Box } from './model';

export interface Asset {
	bytes: Uint8Array<ArrayBuffer>;
	type: string;
	bitmap: ImageBitmap;
}

export class BoardDocument {
	readonly kind = 'board';
	objects = $state.raw<BoardObject[]>([]);
	selected = $state.raw<Set<string>>(new Set());
	readonly assets = new Map<string, Asset>();
	readonly history = new History(Infinity);
	onchange: () => void = () => {};
	#index = new Map<string, BoardObject>();

	constructor(objects: BoardObject[] = []) {
		this.#set(objects);
	}

	lookup = (id: string) => this.#index.get(id);

	#set(objects: BoardObject[]) {
		this.objects = objects;
		this.#index = new Map(objects.map((object) => [object.id, object]));
		this.selected = new Set([...this.selected].filter((id) => this.#index.has(id)));
		this.onchange();
	}

	preview(objects: BoardObject[]) {
		this.#set(objects);
	}

	commit(label: string, objects: BoardObject[], before = this.objects) {
		this.#set(objects);
		if (objects === before) return;
		this.history.push({ label, bytes: 0, undo: () => this.#set(before), redo: () => this.#set(objects) });
	}

	update(label: string, changes: Map<string, BoardObject | null>, before = this.objects) {
		const next = before.flatMap((object) => {
			if (!changes.has(object.id)) return [object];
			const changed = changes.get(object.id);
			return changed ? [changed] : [];
		});
		const known = new Set(before.map((object) => object.id));
		for (const [id, object] of changes) if (object && !known.has(id)) next.push(object);
		this.commit(label, next, before);
	}

	select(ids: Iterable<string>) {
		const chosen = new Set<string>();
		for (const id of ids) {
			const group = this.#index.get(id)?.group;
			if (group) for (const object of this.objects) if (object.group === group) chosen.add(object.id);
			chosen.add(id);
		}
		this.selected = chosen;
		this.onchange();
	}

	get selection() {
		return this.objects.filter((object) => this.selected.has(object.id));
	}

	boundsOf(objects: BoardObject[]): Box | null {
		return union(objects.map((object) => bounds(object, this.lookup)));
	}

	undo() {
		this.history.undo();
	}

	redo() {
		this.history.redo();
	}

	destroy() {
		for (const asset of this.assets.values()) asset.bitmap.close();
		this.assets.clear();
		this.history.clear();
	}
}
