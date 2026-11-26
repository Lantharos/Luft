import { commands } from '#lib/bindings.js';
import { ImageDocument } from '#lib/document/image.svelte.js';
import { LEVELS } from '#lib/gpu/compositor.js';
import { BLEND_MODES, type BlendMode } from '#lib/gpu/shaders/blend.js';
import { TILE } from '#lib/gpu/tiles.js';
import { readTiles } from '#lib/raster/readback.js';
import { renderText } from '#lib/raster/text.js';
import type { TextStyle } from '#lib/document/layers.svelte.js';
import { fetchBytes, tileBatches, uploadTiles } from './pixels';

export const FORMAT = 1;
const PREVIEW = 512;

export interface LayerRecord {
	id: string;
	name: string;
	kind: 'raster' | 'text';
	visible: boolean;
	locked: boolean;
	opacity: number;
	blend: BlendMode;
	text?: TextStyle;
}

export interface ImageRecord {
	format: number;
	kind: 'image';
	width: number;
	height: number;
	layers: LayerRecord[];
}

export function imageRecord(doc: ImageDocument): ImageRecord {
	return {
		format: FORMAT,
		kind: 'image',
		width: doc.width,
		height: doc.height,
		layers: doc.layers.map((layer) => ({
			id: layer.id,
			name: layer.name,
			kind: layer.kind,
			visible: layer.visible,
			locked: layer.locked,
			opacity: layer.opacity,
			blend: layer.blend,
			...(layer.text && { text: $state.snapshot(layer.text) })
		}))
	};
}

export async function sendPreview(id: number, doc: { width: number; height: number; compositor: { levels: import('#lib/gpu/tiles.js').TileGrid[] } }) {
	let level = 0;
	while (level < LEVELS - 1 && Math.max(doc.width, doc.height) >> level > PREVIEW) level++;
	const grid = doc.compositor.levels[level];
	const size = TILE >> level;
	const width = Math.max(1, Math.ceil(doc.width / 2 ** level));
	const height = Math.max(1, Math.ceil(doc.height / 2 ** level));
	const tiles = await readTiles(grid, [...grid.tiles.keys()]);
	const image = new Uint8Array(width * height * 4);
	for (const [index, tile] of tiles) {
		const left = (index % grid.cols) * size;
		const top = Math.floor(index / grid.cols) * size;
		const span = Math.min(size, width - left) * 4;
		for (let row = 0; row < Math.min(size, height - top); row++) image.set(tile.subarray(row * size * 4, row * size * 4 + span), ((top + row) * width + left) * 4);
	}
	await commands.savePreview({ id, width, height }, { body: image });
}

export async function saveImage(doc: ImageDocument, path: string) {
	doc.scene([1, 0, 0, 1, 0, 0]);
	const id = await commands.saveBegin({ path, document: imageRecord(doc) as never });
	const sending: Promise<unknown>[] = [];
	for (const layer of doc.layers) {
		for await (const { indices, body } of tileBatches(layer.pixels)) sending.push(commands.saveTiles({ id, layer: layer.id, indices }, { body }));
	}
	sending.push(sendPreview(id, doc));
	await Promise.all(sending);
	await commands.saveCommit({ id });
	doc.history.markSaved();
}

export async function openImage(record: ImageRecord, pixels: { layer: string; file: string; indices: number[] }[]) {
	const doc = new ImageDocument(record.width, record.height);
	const byLayer = new Map(pixels.map((entry) => [entry.layer, entry]));
	const layers = await Promise.all(
		record.layers.map(async (saved) => {
			const layer = doc.newLayer(saved.kind === 'text' ? 'text' : 'raster', saved.name, saved.id);
			Object.assign(layer, { visible: saved.visible, locked: saved.locked, opacity: saved.opacity, blend: BLEND_MODES.includes(saved.blend) ? saved.blend : 'normal' });
			layer.text = saved.text ?? null;
			const stored = byLayer.get(saved.id);
			if (stored) uploadTiles(layer.pixels, stored.indices, await fetchBytes(stored.file));
			return layer;
		})
	);
	await commands.releaseFiles({ paths: pixels.map((entry) => entry.file) });
	doc.layers = layers;
	doc.activeId = layers.at(-1)?.id ?? '';
	for (const layer of layers) if (layer.text && !layer.pixels.tiles.size) renderText(doc, layer, layer.text, '');
	doc.history.clear();
	doc.invalidate();
	return doc;
}
