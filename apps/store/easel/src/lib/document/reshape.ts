import { Compositor } from '#lib/gpu/compositor.js';
import { kit } from '#lib/gpu/kit.js';
import { projective, type Matrix } from '#lib/gpu/matrix.js';
import { newTile, TILE_BYTES, TileGrid } from '#lib/gpu/tiles.js';
import { assemble, Transformer } from '#lib/raster/transform.js';
import type { ImageDocument } from './image.svelte';
import { applyState, Layer, layerState } from './layers.svelte';

interface Shape {
	width: number;
	height: number;
	layers: Layer[];
	selection: TileGrid;
	compositor: Compositor;
	selectionActive: boolean;
}

function transformGrid(source: TileGrid, matrix: Matrix, target: TileGrid) {
	if (!source.tiles.size) return;
	const transformer = new Transformer(assemble(source));
	for (const index of target.all()) {
		const tile = newTile(target.format);
		const rect = target.rectOf(index);
		transformer.render(projective(matrix), tile, [rect.x, rect.y]);
		target.set(index, tile);
	}
	transformer.destroy();
}

export function transformedLayer(layer: Layer, width: number, height: number, matrix: Matrix, pixels = true) {
	const translationOnly = matrix[0] === 1 && matrix[1] === 0 && matrix[2] === 0 && matrix[3] === 1;
	const text = translationOnly && layer.text ? { ...layer.text, x: layer.text.x + matrix[4], y: layer.text.y + matrix[5] } : null;
	const next = new Layer(layer.kind === 'text' && !text ? 'raster' : layer.kind, layer.name, width, height, layer.id);
	applyState(next, layerState(layer));
	next.text = text;
	if (pixels) transformGrid(layer.pixels, matrix, next.pixels);
	if (layer.mask) {
		next.mask = new TileGrid(width, height, 'r8unorm');
		transformGrid(layer.mask, matrix, next.mask);
	}
	return next;
}

export function reshape(doc: ImageDocument, label: string, width: number, height: number, matrix: Matrix) {
	const layers = doc.layers.map((layer) => transformedLayer(layer, width, height, matrix));
	const selection = new TileGrid(width, height, 'r8unorm');
	if (doc.selectionActive) transformGrid(doc.selection, matrix, selection);
	replaceShape(doc, label, width, height, layers, selection);
}

export function replaceShape(doc: ImageDocument, label: string, width: number, height: number, layers: Layer[], selection: TileGrid) {
	const after: Shape = { width, height, layers, selection, compositor: new Compositor(width, height), selectionActive: doc.selectionActive };
	const before: Shape = { width: doc.width, height: doc.height, layers: doc.layers, selection: doc.selection, compositor: doc.compositor, selectionActive: doc.selectionActive };
	const bounds = doc.selectionBounds;
	const apply = (shape: Shape) => {
		doc.width = shape.width;
		doc.height = shape.height;
		doc.layers = shape.layers;
		doc.selection = shape.selection;
		doc.compositor = shape.compositor;
		doc.selectionActive = shape.selectionActive;
		doc.selectionBounds = shape === before ? bounds : shape.selectionActive ? { x: 0, y: 0, width, height } : null;
		doc.invalidate();
	};
	apply(after);
	kit.flush();
	doc.record({
		label,
		bytes: layers.reduce((sum, layer) => sum + layer.pixels.tiles.size, 0) * TILE_BYTES,
		undo: () => apply(before),
		redo: () => apply(after),
		forget: (side) => {
			const dropped = side === 'past' ? before : after;
			for (const layer of dropped.layers) {
				layer.pixels.destroy();
				layer.mask?.destroy();
			}
			dropped.selection.destroy();
			dropped.compositor.destroy();
		}
	});
}
