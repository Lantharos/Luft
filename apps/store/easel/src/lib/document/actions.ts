import { t } from '@luft/i18n';
import { kit } from '#lib/gpu/kit.js';
import { premultiplied } from '#lib/raster/color.js';
import type { ImageDocument } from './image.svelte';
import type { Layer } from './layers.svelte';

const PAINT = 0;
const ERASE = 1;
const OVER = 2;

function params(mode: number, color: [number, number, number, number] = [0, 0, 0, 0], opacity = 1) {
	const data = new Float32Array(8);
	data.set(color);
	data[4] = opacity;
	new Uint32Array(data.buffer)[5] = mode;
	return kit.uniform(data);
}

const editable = (layer: Layer) => !layer.locked && layer.kind === 'raster';

export function fillSelection(doc: ImageDocument, color: string) {
	const layer = doc.active;
	if (!doc.selectionActive || !editable(layer)) return;
	const uniform = params(PAINT, premultiplied(color));
	doc.paint(t('easel-history-fill'), layer, [...doc.selection.tiles.keys()], (index, target, before) =>
		kit.fill(target, kit.bake, [before?.createView() ?? kit.clear, doc.selection.get(index)!.createView(), kit.full, kit.clear, uniform])
	);
}

export function eraseSelection(doc: ImageDocument) {
	const layer = doc.active;
	if (!doc.selectionActive || !editable(layer)) return;
	const uniform = params(ERASE);
	const indices = [...doc.selection.tiles.keys()].filter((index) => layer.pixels.get(index));
	doc.paint(t('easel-history-erase-selection'), layer, indices, (index, target, before) =>
		kit.fill(target, kit.bake, [before!.createView(), doc.selection.get(index)!.createView(), kit.full, kit.clear, uniform])
	);
}

export function selectAll(doc: ImageDocument) {
	const uniform = params(PAINT, [1, 1, 1, 1]);
	doc.replaceSelection(t('easel-history-select'), doc.selection.all(), (_index, target) => kit.fill(target, kit.bakeMask, [kit.clear, kit.full, kit.full, kit.clear, uniform]), doc.bounds);
}

export function invertSelection(doc: ImageDocument) {
	if (!doc.selectionActive) return selectAll(doc);
	const uniform = params(ERASE);
	doc.replaceSelection(t('easel-history-invert'), doc.selection.all(), (_index, target, before) => kit.fill(target, kit.bakeMask, [kit.full, before?.createView() ?? kit.clear, kit.full, kit.clear, uniform]), doc.bounds);
}

export function overTiles(doc: ImageDocument, layer: Layer, label: string, source: Map<number, GPUTexture>) {
	const uniform = params(OVER);
	doc.paint(label, layer, [...source.keys()], (index, target, before) =>
		kit.fill(target, kit.bake, [before?.createView() ?? kit.clear, kit.full, kit.full, source.get(index)!.createView(), uniform])
	);
}
