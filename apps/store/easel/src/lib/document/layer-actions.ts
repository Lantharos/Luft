import { t } from '@luft/i18n';
import { kit } from '#lib/gpu/kit.js';
import { blendTile } from '#lib/gpu/compositor.js';
import { copyGrid, newTile } from '#lib/gpu/tiles.js';
import type { ImageDocument } from './image.svelte';
import { newAdjustment, type AdjustmentType } from '#lib/adjust/adjustments.js';
import { Batch, StateChange } from './entries';
import type { Entry } from './history.svelte';
import { applyState, layerState, type Layer } from './layers.svelte';

export function nextLayerName(doc: ImageDocument) {
	return t('easel-layer-name', { number: doc.layers.length + 1 });
}

export function addLayer(doc: ImageDocument) {
	const layer = doc.newLayer('raster', nextLayerName(doc));
	insertAbove(doc, layer, t('easel-history-add-layer'));
	return layer;
}

export function deleteLayer(doc: ImageDocument, layer: Layer) {
	const doomed = new Set([layer.id]);
	for (const other of doc.layers) if (other.parent && doomed.has(other.parent)) doomed.add(other.id);
	const remaining = doc.layers.filter((other) => !doomed.has(other.id));
	if (!remaining.length) return;
	const index = doc.layers.indexOf(layer);
	doc.setLayers(t('easel-history-delete-layer'), remaining, remaining[Math.max(0, index - 1)].id);
}

export function duplicateLayer(doc: ImageDocument, layer: Layer) {
	const copy = doc.newLayer(layer.kind, t('easel-layer-copy', { name: layer.name }));
	applyState(copy, { ...layerState(layer), name: copy.name });
	copy.text = layer.text && { ...layer.text };
	copy.mask = layer.mask && copyGrid(layer.mask, (source, target) => kit.copy(source, target));
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

export function canMerge(doc: ImageDocument, layer: Layer) {
	const below = doc.layers[doc.layers.indexOf(layer) - 1];
	return Boolean(below && below.kind === 'raster' && (layer.kind === 'raster' || layer.kind === 'text') && below.parent === layer.parent);
}

export function mergeDown(doc: ImageDocument, layer: Layer) {
	const index = doc.layers.indexOf(layer);
	const below = doc.layers[index - 1];
	if (!canMerge(doc, layer)) return;
	const merged = doc.newLayer('raster', below.name);
	applyState(merged, layerState(below));
	for (const tile of new Set([...below.pixels.tiles.keys(), ...layer.pixels.tiles.keys()])) {
		const target = newTile();
		const mask = layer.maskEnabled ? (layer.mask?.get(tile)?.createView() ?? kit.full) : kit.full;
		blendTile(target, below.pixels.get(tile)?.createView() ?? kit.clear, layer.pixels.get(tile)?.createView() ?? kit.clear, mask, layer.visible ? layer.opacity : 0, layer.blend, null, null, null, tile);
		merged.pixels.set(tile, target);
	}
	merged.mask = below.mask && copyGrid(below.mask, (source, target) => kit.copy(source, target));
	kit.flush();
	doc.setLayers(t('easel-history-merge'), [...doc.layers.slice(0, index - 1), merged, ...doc.layers.slice(index + 1)], merged.id);
}

function insertAbove(doc: ImageDocument, layer: Layer, label: string) {
	const active = doc.active;
	layer.parent = active?.kind === 'group' ? active.id : (active?.parent ?? null);
	const index = active ? doc.layers.indexOf(active) + 1 : doc.layers.length;
	doc.setLayers(label, [...doc.layers.slice(0, index), layer, ...doc.layers.slice(index)], layer.id);
}

export function addAdjustment(doc: ImageDocument, type: AdjustmentType, name: string) {
	const layer = doc.newLayer('adjustment', name);
	layer.adjustment = newAdjustment(type);
	insertAbove(doc, layer, t('easel-history-add-adjustment'));
	return layer;
}

export function groupLayer(doc: ImageDocument, layer: Layer) {
	const label = t('easel-history-group');
	const group = doc.newLayer('group', t('easel-group-name', { number: doc.layers.filter((other) => other.kind === 'group').length + 1 }));
	group.parent = layer.parent;
	const index = doc.layers.indexOf(layer) + 1;
	const added = doc.setLayers(label, [...doc.layers.slice(0, index), group, ...doc.layers.slice(index)], layer.id, false);
	const before = layerState(layer);
	layer.parent = group.id;
	doc.record(new Batch(label, [added, new StateChange(label, layer, before, layerState(layer), () => doc.invalidate())]));
	doc.activeId = group.id;
}

export function ungroup(doc: ImageDocument, group: Layer) {
	const label = t('easel-history-ungroup');
	const parts: Entry[] = doc.layers
		.filter((layer) => layer.parent === group.id)
		.map((layer) => {
			const before = layerState(layer);
			layer.parent = group.parent;
			return new StateChange(label, layer, before, layerState(layer), () => doc.invalidate());
		});
	parts.push(doc.setLayers(label, doc.layers.filter((layer) => layer !== group), doc.activeId, false));
	doc.record(new Batch(label, parts));
}
