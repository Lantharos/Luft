import { TILE_BYTES, type TileGrid } from '#lib/gpu/tiles.js';

const BUDGET = 1536 * TILE_BYTES;
const MOST = 300;

export interface Entry {
	label: string;
	bytes: number;
	undo(): void;
	redo(): void;
	forget?(side: 'past' | 'future'): void;
}

export class TileChange implements Entry {
	readonly bytes: number;

	constructor(
		readonly label: string,
		private readonly grid: TileGrid,
		private readonly changes: Map<number, [GPUTexture | undefined, GPUTexture | undefined]>,
		private readonly changed: (indices: number[]) => void
	) {
		this.bytes = changes.size * TILE_BYTES;
	}

	undo() {
		for (const [index, [before]] of this.changes) this.grid.set(index, before);
		this.changed([...this.changes.keys()]);
	}

	redo() {
		for (const [index, [, after]] of this.changes) this.grid.set(index, after);
		this.changed([...this.changes.keys()]);
	}

	forget(side: 'past' | 'future') {
		for (const [before, after] of this.changes.values()) (side === 'past' ? before : after)?.destroy();
	}
}

export class History {
	entries = $state<Entry[]>([]);
	position = $state(0);
	saved = $state(0);
	#bytes = 0;

	constructor(private readonly most = MOST) {}

	get canUndo() {
		return this.position > 0;
	}

	get canRedo() {
		return this.position < this.entries.length;
	}

	get modified() {
		return this.saved !== this.position;
	}

	push(entry: Entry) {
		const dropped = this.entries.slice(this.position);
		for (const future of dropped) {
			future.forget?.('future');
			this.#bytes -= future.bytes;
		}
		if (this.saved > this.position) this.saved = -1;
		this.entries = [...this.entries.slice(0, this.position), entry];
		this.position = this.entries.length;
		this.#bytes += entry.bytes;
		this.#trim();
	}

	undo() {
		if (!this.canUndo) return;
		this.entries[--this.position].undo();
	}

	redo() {
		if (!this.canRedo) return;
		this.entries[this.position++].redo();
	}

	jump(position: number) {
		while (this.position > position) this.undo();
		while (this.position < position) this.redo();
	}

	markSaved() {
		this.saved = this.position;
	}

	clear() {
		for (const [index, entry] of this.entries.entries()) entry.forget?.(index < this.position ? 'past' : 'future');
		this.entries = [];
		this.position = 0;
		this.saved = 0;
		this.#bytes = 0;
	}

	#trim() {
		let drop = 0;
		while (this.entries.length - drop > 1 && (this.#bytes > BUDGET || this.entries.length - drop > this.most)) {
			const oldest = this.entries[drop++];
			oldest.forget?.('past');
			this.#bytes -= oldest.bytes;
		}
		if (!drop) return;
		this.entries = this.entries.slice(drop);
		this.position -= drop;
		this.saved -= drop;
	}
}
