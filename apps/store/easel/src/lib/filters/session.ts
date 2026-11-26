import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Layer } from '#lib/document/layers.svelte.js';
import { blur, run, runInto } from '#lib/gpu/filters.js';
import { kit } from '#lib/gpu/kit.js';
import { newTile, TileGrid } from '#lib/gpu/tiles.js';
import { assemble } from '#lib/raster/transform.js';
import type { FilterKind } from './filters';

export class FilterSession {
	readonly #source: GPUTexture;
	readonly #preview: TileGrid;
	readonly #indices: number[];
	#filtered: GPUTexture | null = null;

	constructor(
		private readonly doc: ImageDocument,
		private readonly layer: Layer,
		private readonly kind: FilterKind
	) {
		this.#source = assemble(layer.pixels);
		this.#preview = new TileGrid(doc.width, doc.height);
		this.#indices = doc.selectionActive ? [...doc.selection.tiles.keys()].filter((index) => layer.pixels.get(index)) : [...layer.pixels.tiles.keys()];
		doc.preview = { layer: layer.id, grid: this.#preview };
		for (const [index, tile] of layer.pixels.tiles) this.#preview.set(index, tile);
	}

	#compute(values: Record<string, number>) {
		const source = this.#source;
		switch (this.kind) {
			case 'blur':
				return blur(source, values.radius);
			case 'motion': {
				const angle = (values.angle * Math.PI) / 180;
				return run('motion', source, [Math.cos(angle), Math.sin(angle), values.distance]);
			}
			case 'sharpen': {
				const soft = blur(source, values.radius);
				const sharp = run('unsharp', source, [values.amount, values.threshold], source.width, source.height, soft);
				kit.flush();
				soft.destroy();
				return sharp;
			}
			case 'denoise':
				return run('denoise', source, [values.strength]);
			case 'vignette':
				return run('vignette', source, [values.amount, values.size]);
			default:
				return run('pixelate', source, [values.block], source.width, source.height, source);
		}
	}

	#mix(target: GPUTexture, index: number, filtered: GPUTexture) {
		const rect = this.layer.pixels.rectOf(index);
		const amount = this.doc.selectionActive ? (this.doc.selection.get(index)?.createView() ?? kit.clear) : kit.full;
		runInto(target, 'mix', this.layer.pixels.get(index)!, [rect.x, rect.y], filtered, [amount]);
	}

	update(values: Record<string, number>) {
		const filtered = this.#compute(values);
		for (const index of this.#indices) {
			let tile = this.#preview.get(index);
			if (tile === this.layer.pixels.get(index)) this.#preview.set(index, (tile = newTile()));
			this.#mix(tile!, index, filtered);
		}
		kit.flush();
		this.#filtered?.destroy();
		this.#filtered = filtered;
		this.doc.invalidate(this.#indices);
	}

	apply(label: string) {
		const filtered = this.#filtered;
		this.#end();
		if (!filtered) return;
		this.doc.paint(label, this.layer, this.#indices, (index, target) => this.#mix(target, index, filtered));
		kit.flush();
		filtered.destroy();
	}

	cancel() {
		this.#end();
		this.#filtered?.destroy();
		this.doc.invalidate(this.#indices);
	}

	#end() {
		this.doc.preview = null;
		kit.flush();
		for (const [index, tile] of this.#preview.tiles) if (tile !== this.layer.pixels.get(index)) tile.destroy();
		this.#preview.tiles.clear();
		this.#source.destroy();
	}
}
