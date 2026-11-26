import type { Entry } from './history.svelte';
import { applyState, type Layer, type LayerState } from './layers.svelte';

export class LayersChange implements Entry {
	readonly bytes = 0;

	constructor(
		readonly label: string,
		private readonly before: Layer[],
		private readonly after: Layer[],
		private readonly set: (layers: Layer[]) => void
	) {}

	undo() {
		this.set(this.before);
	}

	redo() {
		this.set(this.after);
	}

	forget(side: 'past' | 'future') {
		const [dropped, kept] = side === 'past' ? [this.before, this.after] : [this.after, this.before];
		for (const layer of dropped) {
			if (kept.includes(layer)) continue;
			layer.pixels.destroy();
			layer.mask?.destroy();
		}
	}
}

export class StateChange implements Entry {
	readonly bytes = 0;

	constructor(
		readonly label: string,
		readonly layer: Layer,
		private readonly before: LayerState,
		public after: LayerState,
		private readonly changed: (layer: Layer) => void
	) {}

	undo() {
		applyState(this.layer, this.before);
		this.changed(this.layer);
	}

	redo() {
		applyState(this.layer, this.after);
		this.changed(this.layer);
	}
}

export class Batch implements Entry {
	readonly bytes: number;

	constructor(
		readonly label: string,
		private readonly parts: Entry[]
	) {
		this.bytes = parts.reduce((sum, part) => sum + part.bytes, 0);
	}

	undo() {
		for (const part of [...this.parts].reverse()) part.undo();
	}

	redo() {
		for (const part of this.parts) part.redo();
	}

	forget(side: 'past' | 'future') {
		for (const part of this.parts) part.forget?.(side);
	}
}

export class Toggle implements Entry {
	readonly bytes = 0;

	constructor(
		readonly label: string,
		private readonly apply: (forward: boolean) => void
	) {}

	undo() {
		this.apply(false);
	}

	redo() {
		this.apply(true);
	}
}
