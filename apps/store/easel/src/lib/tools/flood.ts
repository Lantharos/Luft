import type { ImageDocument } from '#lib/document/image.svelte.js';
import { kit } from '#lib/gpu/kit.js';
import { newTile } from '#lib/gpu/tiles.js';
import { premultiplied } from '#lib/raster/color.js';
import { floodFill } from '#lib/raster/selection/flood.js';
import { release } from '#lib/raster/mask.js';
import { readTiles, writeRegion } from '#lib/raster/readback.js';
import { combineSelection, type SelectMode } from '#lib/raster/selection/selection.js';
import type { ToolEvent, ToolHandler } from './tool';

export interface FloodHost {
	doc: ImageDocument;
	tolerance(): number;
	contiguous(): boolean;
	color(): string;
	mode(event: ToolEvent): SelectMode;
	label: string;
	busy(running: boolean): void;
}

async function maskAt(host: FloodHost, event: ToolEvent) {
	const { doc } = host;
	const x = Math.floor(event.x);
	const y = Math.floor(event.y);
	if (x < 0 || y < 0 || x >= doc.width || y >= doc.height) return null;
	const grid = doc.active.pixels;
	const tiles = await readTiles(grid, grid.all());
	const { mask, bounds } = await floodFill({ tiles, cols: grid.cols, width: doc.width, height: doc.height, x, y, tolerance: host.tolerance(), contiguous: host.contiguous() });
	const shape = new Map<number, GPUTexture>();
	writeRegion(doc.selection, mask, bounds, (index) => {
		const texture = newTile('r8unorm');
		shape.set(index, texture);
		return texture;
	});
	return { shape, bounds };
}

export class WandTool implements ToolHandler {
	readonly cursor = 'crosshair';

	constructor(private readonly host: FloodHost) {}

	async down(event: ToolEvent) {
		const mode = this.host.mode(event);
		this.host.busy(true);
		const found = await maskAt(this.host, event);
		this.host.busy(false);
		if (found) combineSelection(this.host.doc, this.host.label, found.shape, found.bounds, mode);
	}
}

export class FillTool implements ToolHandler {
	readonly cursor = 'crosshair';

	constructor(private readonly host: FloodHost) {}

	async down(event: ToolEvent) {
		const { doc } = this.host;
		const layer = doc.active;
		if (layer.locked || layer.kind !== 'raster') return;
		this.host.busy(true);
		const found = await maskAt(this.host, event);
		this.host.busy(false);
		if (!found) return;
		const params = new Float32Array(8);
		params.set(premultiplied(this.host.color()));
		params[4] = 1;
		const uniform = kit.uniform(params);
		const selection = doc.selectionActive ? doc.selection : null;
		doc.paint(this.host.label, layer, [...found.shape.keys()], (index, target, before) => {
			kit.fill(target, kit.bake, [
				before?.createView() ?? kit.clear,
				found.shape.get(index)!.createView(),
				selection ? (selection.get(index)?.createView() ?? kit.clear) : kit.full,
				kit.clear,
				uniform
			]);
		});
		release(found.shape);
	}
}
