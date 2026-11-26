import { t } from '@luft/i18n';
import { kit } from '#lib/gpu/kit.js';
import { newTile, TileGrid } from '#lib/gpu/tiles.js';
import { Batch } from './entries';
import type { Entry } from './history.svelte';
import type { ImageDocument } from './image.svelte';
import type { Layer } from './layers.svelte';

const PAINT = 0;
const ERASE = 1;
const MULTIPLY = 3;

function uniform(mode: number, color = [1, 1, 1, 1]) {
	const data = new Float32Array(8);
	data.set(color);
	data[4] = 1;
	new Uint32Array(data.buffer)[5] = mode;
	return kit.uniform(data);
}

export function setMask(doc: ImageDocument, layer: Layer, label: string, mask: TileGrid | null): Entry {
	const before = layer.mask;
	const apply = (forward: boolean) => {
		layer.mask = forward ? mask : before;
		layer.touch();
		doc.invalidate();
	};
	apply(true);
	return { label, bytes: 0, undo: () => apply(false), redo: () => apply(true), forget: (side) => (side === 'past' ? before : mask)?.destroy() };
}

export function addMask(doc: ImageDocument, layer: Layer, fromSelection: boolean) {
	const mask = new TileGrid(doc.width, doc.height, 'r8unorm');
	const fill = uniform(PAINT);
	for (const index of mask.all()) {
		const tile = newTile('r8unorm');
		const selected = doc.selection.get(index);
		if (!fromSelection) kit.fill(tile, kit.bakeMask, [kit.clear, kit.full, kit.full, kit.clear, fill]);
		else if (selected) kit.copy(selected, tile);
		else kit.pass(tile.createView(), [0, 0, 0, 0]).end();
		mask.set(index, tile);
	}
	kit.flush();
	doc.record(setMask(doc, layer, t(fromSelection ? 'easel-history-mask-selection' : 'easel-history-mask'), mask));
	doc.maskEditing = true;
}

export function invertMask(doc: ImageDocument, layer: Layer) {
	if (!layer.mask) return;
	const erase = uniform(ERASE);
	doc.record(doc.tileChange(t('easel-history-mask-invert'), layer.mask, layer.mask.all(), (_index, target, before) => kit.fill(target, kit.bakeMask, [kit.full, before?.createView() ?? kit.clear, kit.full, kit.clear, erase])));
	layer.touch();
}

export function deleteMask(doc: ImageDocument, layer: Layer) {
	if (!layer.mask) return;
	doc.maskEditing = false;
	doc.record(setMask(doc, layer, t('easel-history-mask-delete'), null));
}

export function applyMask(doc: ImageDocument, layer: Layer) {
	const mask = layer.mask;
	if (!mask || layer.kind !== 'raster') return;
	const multiply = uniform(MULTIPLY);
	const pixels = doc.tileChange(t('easel-history-mask-apply'), layer.pixels, [...layer.pixels.tiles.keys()], (index, target, before) =>
		kit.fill(target, kit.bake, [before!.createView(), mask.get(index)?.createView() ?? kit.full, kit.full, kit.clear, multiply])
	);
	doc.maskEditing = false;
	doc.record(new Batch(t('easel-history-mask-apply'), [pixels, setMask(doc, layer, '', null)]));
}
