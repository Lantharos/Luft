import { t } from '@luft/i18n';
import { kit } from '#lib/gpu/kit.js';
import { BLEND_MODES } from '#lib/gpu/shaders/blend.js';
import { newTile } from '#lib/gpu/tiles.js';
import type { ImageDocument } from './image.svelte';
import { layerState, type Layer } from './layers.svelte';

export function nextLayerName(doc: ImageDocument) {
	return t('easel-layer-name', { number: doc.layers.length + 1 });
}

export function addLayer(doc: ImageDocument) {
	const layer = doc.newLayer('raster', nextLayerName(doc));
	const index = doc.layers.indexOf(doc.active) + 1;
	doc.setLayers(t('easel-history-add-layer'), [...doc.layers.slice(0, index), layer, ...doc.layers.slice(index)], layer.id);
	return layer;
}

export function deleteLayer(doc: ImageDocument, layer: Layer) {
	if (doc.layers.length < 2) return;
	const index = doc.layers.indexOf(layer);
	const remaining = doc.layers.filter((other) => other !== layer);
	doc.setLayers(t('easel-history-delete-layer'), remaining, remaining[Math.max(0, index - 1)].id);
}

export function duplicateLayer(doc: ImageDocument, layer: Layer) {
	const copy = doc.newLayer(layer.kind, t('easel-layer-copy', { name: layer.name }));
	Object.assign(copy, { ...layerState(layer), name: copy.name });
	copy.text = layer.text && { ...layer.text };
	for (const [index, texture] of layer.pixels.tiles) {
		const tile = newTile();
		kit.copy(texture, tile);
		copy.pixels.set(index, tile);
	}
	kit.flush();
	const index = doc.layers.indexOf(layer) + 1;
	doc.setLayers(t('easel-history-duplicate-layer'), [...doc.layers.slice(0, index), copy, ...doc.layers.slice(index)], copy.id);
}

export function moveLayer(doc: ImageDocument, layer: Layer, to: number) {
	const from = doc.layers.indexOf(layer);
	if (from === to || to < 0 || to >= doc.layers.length) return;
	const layers = doc.layers.filter((other) => other !== layer);
	layers.splice(to, 0, layer);
	doc.setLayers(t('easel-history-move-layer'), layers, layer.id);
}

export function mergeDown(doc: ImageDocument, layer: Layer) {
	const index = doc.layers.indexOf(layer);
	const below = doc.layers[index - 1];
	if (!below) return;
	const merged = doc.newLayer('raster', below.name);
	Object.assign(merged, layerState(below));
	const params = new Float32Array(16);
	params[4] = layer.visible ? layer.opacity : 0;
	new Uint32Array(params.buffer)[5] = BLEND_MODES.indexOf(layer.blend);
	const uniform = kit.uniform(params);
	for (const tile of new Set([...below.pixels.tiles.keys(), ...layer.pixels.tiles.keys()])) {
		const target = newTile();
		kit.fill(target, kit.composite, [
			below.pixels.get(tile)?.createView() ?? kit.clear,
			layer.pixels.get(tile)?.createView() ?? kit.clear,
			kit.clear,
			kit.full,
			kit.full,
			uniform
		]);
		merged.pixels.set(tile, target);
	}
	kit.flush();
	doc.setLayers(t('easel-history-merge'), [...doc.layers.slice(0, index - 1), merged, ...doc.layers.slice(index + 1)], merged.id);
}
