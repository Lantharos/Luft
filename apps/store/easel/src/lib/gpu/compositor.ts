import { adjustValues, type Adjust } from './shaders/adjust';
import { BLEND_MODES } from './shaders/blend';
import { kit } from './kit';
import { newTile, TILE, TileGrid } from './tiles';

export const LEVELS = 5;

export interface CompositeLayer {
	pixels: TileGrid;
	mask: TileGrid | null;
	opacity: number;
	blend: (typeof BLEND_MODES)[number];
	visible: boolean;
	stroke: LiveStroke | null;
	adjust: Adjust | null;
}

export interface LiveStroke {
	grid: TileGrid;
	color: [number, number, number, number];
	opacity: number;
	erase: boolean;
}

export class Compositor {
	readonly levels: TileGrid[];
	#scratch: [GPUTexture, GPUTexture];
	#params = new ArrayBuffer(64);

	constructor(
		readonly width: number,
		readonly height: number
	) {
		this.levels = Array.from({ length: LEVELS }, () => new TileGrid(width, height));
		this.#scratch = [newTile(), newTile()];
	}

	render(indices: Iterable<number>, layers: CompositeLayer[], selection: TileGrid | null) {
		for (const index of indices) this.#tile(index, layers, selection);
	}

	#tile(index: number, layers: CompositeLayer[], selection: TileGrid | null) {
		let [front, back] = this.#scratch;
		let drawn = false;
		for (const layer of layers) {
			if (!layer.visible || layer.opacity <= 0) continue;
			const pixels = layer.pixels.get(index);
			const stroke = layer.stroke?.grid.get(index);
			if (!pixels && !(stroke && layer.stroke && !layer.stroke.erase)) continue;
			const floats = new Float32Array(this.#params);
			const words = new Uint32Array(this.#params);
			floats.set(layer.stroke?.color ?? [0, 0, 0, 0], 0);
			floats[4] = layer.opacity;
			words[5] = BLEND_MODES.indexOf(layer.blend);
			words[6] = stroke ? (layer.stroke!.erase ? 2 : 1) : 0;
			floats[7] = layer.stroke?.opacity ?? 0;
			floats.set(adjustValues(layer.adjust), 8);
			words[13] = layer.adjust ? 1 : 0;
			kit.fill(back, kit.composite, [
				(drawn ? front.createView() : kit.clear),
				pixels?.createView() ?? kit.clear,
				stroke?.createView() ?? kit.clear,
				selection?.get(index)?.createView() ?? (selection ? kit.clear : kit.full),
				layer.mask?.get(index)?.createView() ?? kit.full,
				kit.uniform(floats)
			]);
			[front, back] = [back, front];
			drawn = true;
		}
		this.#scratch = [front, back];
		const base = this.levels[0];
		if (!drawn) {
			for (const level of this.levels) {
				level.get(index)?.destroy();
				level.set(index, undefined);
			}
			return;
		}
		let target = base.get(index);
		if (!target) base.set(index, (target = newTile()));
		kit.copy(front, target);
		this.#pyramid(index);
	}

	#pyramid(index: number) {
		for (let level = 1; level < LEVELS; level++) {
			const grid = this.levels[level];
			let target = grid.get(index);
			if (!target) grid.set(index, (target = newTile('rgba8unorm', TILE >> level)));
			kit.fill(target, kit.downsample, [this.levels[level - 1].get(index)!.createView()]);
		}
	}

	destroy() {
		for (const level of this.levels) level.destroy();
		for (const scratch of this.#scratch) scratch.destroy();
	}
}
