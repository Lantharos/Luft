import { t } from '@luft/i18n';
import type { Task } from '#lib/bindings.js';
import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Layer } from '#lib/document/layers.svelte.js';
import { replaceShape, transformedLayer } from '#lib/document/reshape.js';
import { setMask } from '#lib/document/masks.js';
import { device } from '#lib/gpu/device.js';
import { kit } from '#lib/gpu/kit.js';
import { projective, scaling } from '#lib/gpu/matrix.js';
import { newTile, TileGrid, type Rect } from '#lib/gpu/tiles.js';
import { uploadImage } from '#lib/files/pixels.js';
import { readRegion, readTexture, writeRegion } from '#lib/raster/readback.js';
import { assemble, Transformer } from '#lib/raster/transform.js';
import { models } from './models.svelte';
import { runModel } from './run';

const MATTE_SIDE = 1536;
const OVER = 2;
const MAX_SIDE = 16384;
const PAD = 0.3;

function texture(width: number, height: number, format: GPUTextureFormat) {
	return device.createTexture({ size: [width, height], format, usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST });
}

async function shrunk(grid: TileGrid, side: number) {
	const scale = Math.min(1, side / Math.max(grid.width, grid.height));
	const width = Math.max(1, Math.round(grid.width * scale));
	const height = Math.max(1, Math.round(grid.height * scale));
	const transformer = new Transformer(assemble(grid));
	const target = texture(width, height, 'rgba8unorm');
	transformer.render(projective(scaling(scale)), target, [0, 0], [width, height]);
	const pixels = await readTexture(target);
	transformer.destroy();
	target.destroy();
	return { pixels, width, height };
}

function grown(mask: Uint8Array, width: number, height: number, doc: ImageDocument) {
	kit.flush();
	const small = texture(width, height, 'r8unorm');
	device.queue.writeTexture({ texture: small }, mask, { bytesPerRow: width }, [width, height]);
	const transformer = new Transformer(small);
	const grid = new TileGrid(doc.width, doc.height, 'r8unorm');
	for (const index of grid.all()) {
		const tile = newTile('r8unorm');
		const rect = grid.rectOf(index);
		transformer.render(projective(scaling(doc.width / width, doc.height / height)), tile, [rect.x, rect.y]);
		grid.set(index, tile);
	}
	transformer.destroy();
	return grid;
}

async function matte(doc: ImageDocument, grid: TileGrid) {
	if (!(await models.ensure('matte'))) return null;
	const image = await shrunk(grid, MATTE_SIDE);
	const result = await runModel('matte', image.pixels, image.width, image.height);
	return grown(result.data, image.width, image.height, doc);
}

export async function removeBackground(doc: ImageDocument, layer: Layer) {
	const mask = await matte(doc, layer.pixels);
	if (!mask) return;
	doc.record(setMask(doc, layer, t('easel-history-remove-background'), mask));
}

export async function selectSubject(doc: ImageDocument) {
	doc.scene([1, 0, 0, 1, 0, 0]);
	const mask = await matte(doc, doc.compositor.levels[0]);
	if (!mask) return;
	doc.replaceSelection(t('easel-history-select-subject'), mask.all(), (index, target) => kit.copy(mask.get(index)!, target), doc.bounds);
	kit.flush();
	mask.destroy();
}

function padded(bounds: Rect, doc: ImageDocument): Rect {
	const grow = Math.max(bounds.width, bounds.height) * PAD;
	const x = Math.max(0, Math.floor(bounds.x - grow));
	const y = Math.max(0, Math.floor(bounds.y - grow));
	return { x, y, width: Math.min(doc.width, Math.ceil(bounds.x + bounds.width + grow)) - x, height: Math.min(doc.height, Math.ceil(bounds.y + bounds.height + grow)) - y };
}

async function fillIn(doc: ImageDocument, layer: Layer, bounds: Rect, mask: TileGrid, label: string) {
	if (!(await models.ensure('inpaint'))) return;
	const area = padded(bounds, doc);
	const pixels = await readRegion(layer.pixels, area);
	const hole = await readRegion(mask, area);
	const result = await runModel('inpaint', pixels, area.width, area.height, hole);
	const painted = new Map<number, GPUTexture>();
	writeRegion(layer.pixels, result.data, area, (index) => {
		const tile = newTile();
		painted.set(index, tile);
		return tile;
	});
	const params = new Float32Array(8);
	params[4] = 1;
	new Uint32Array(params.buffer)[5] = OVER;
	const uniform = kit.uniform(params);
	doc.paint(label, layer, [...painted.keys()], (index, target, before) =>
		kit.fill(target, kit.bake, [before?.createView() ?? kit.clear, mask.get(index)?.createView() ?? kit.clear, kit.full, painted.get(index)!.createView(), uniform])
	);
	kit.flush();
	for (const tile of painted.values()) tile.destroy();
}

export async function removeAndFill(doc: ImageDocument, layer: Layer) {
	if (!doc.selectionActive || !doc.selectionBounds || !layer.paintable) return;
	await fillIn(doc, layer, doc.selectionBounds, doc.selection, t('easel-history-remove-fill'));
}

export async function removeArea(doc: ImageDocument, layer: Layer, area: Rect) {
	const mask = new TileGrid(doc.width, doc.height, 'r8unorm');
	writeRegion(mask, new Uint8Array(area.width * area.height).fill(255), area, (index) => {
		const tile = newTile('r8unorm');
		mask.set(index, tile);
		return tile;
	});
	await fillIn(doc, layer, area, mask, t('easel-history-remove-fill'));
	mask.destroy();
}

export async function upscale(doc: ImageDocument, factor: 2 | 4) {
	const width = doc.width * factor;
	const height = doc.height * factor;
	if (width > MAX_SIDE || height > MAX_SIDE) throw new Error(t('easel-error-too-large', { size: MAX_SIDE }));
	const task: Task = factor === 2 ? 'upscale2' : 'upscale4';
	if (!(await models.ensure('upscale'))) return;
	const layers = [];
	for (const layer of doc.layers) {
		const raster = layer.kind === 'raster' || layer.kind === 'text';
		const next = transformedLayer(layer, width, height, [factor, 0, 0, factor, 0, 0], !raster);
		if (raster && layer.pixels.tiles.size) {
			const pixels = await readRegion(layer.pixels, doc.bounds);
			const result = await runModel(task, pixels, doc.width, doc.height);
			uploadImage(next.pixels, result.data, result.width, result.height);
		}
		layers.push(next);
	}
	replaceShape(doc, t('easel-history-upscale'), width, height, layers, new TileGrid(width, height, 'r8unorm'));
}
