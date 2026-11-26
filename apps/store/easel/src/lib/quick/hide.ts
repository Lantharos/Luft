import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Layer } from '#lib/document/layers.svelte.js';
import type { Rect } from '#lib/gpu/tiles.js';
import { clip } from '#lib/raster/mask.js';
import { readRegion } from '#lib/raster/readback.js';
import { stamp } from '#lib/raster/stamp.js';
import { removeArea } from '#lib/ai/actions.js';

const BLOCKS = 14;

export type HideKind = 'blur' | 'redact' | 'remove';

export async function hideArea(doc: ImageDocument, layer: Layer, area: Rect, kind: HideKind, label: string) {
	const rect = clip(area, doc.width, doc.height);
	if (!rect) return;
	if (kind === 'remove') return removeArea(doc, layer, rect);
	if (kind === 'redact') {
		stamp(doc, layer, label, rect, (context) => {
			context.fillStyle = '#000';
			context.fillRect(rect.x, rect.y, rect.width, rect.height);
		}, false);
		return;
	}
	doc.scene([1, 0, 0, 1, 0, 0]);
	const pixels = await readRegion(doc.compositor.levels[0], rect);
	const block = Math.max(4, Math.round(Math.max(rect.width, rect.height) / BLOCKS));
	const small = new OffscreenCanvas(Math.max(1, Math.round(rect.width / block)), Math.max(1, Math.round(rect.height / block)));
	const source = new OffscreenCanvas(rect.width, rect.height);
	const straight = new Uint8ClampedArray(pixels.length);
	for (let at = 0; at < pixels.length; at += 4) {
		const alpha = pixels[at + 3] || 1;
		straight.set([(pixels[at] * 255) / alpha, (pixels[at + 1] * 255) / alpha, (pixels[at + 2] * 255) / alpha, 255], at);
	}
	source.getContext('2d')!.putImageData(new ImageData(straight, rect.width, rect.height), 0, 0);
	const reduce = small.getContext('2d')!;
	reduce.imageSmoothingQuality = 'high';
	reduce.drawImage(source, 0, 0, small.width, small.height);
	stamp(doc, layer, label, rect, (context) => {
		context.imageSmoothingEnabled = false;
		context.drawImage(small, rect.x, rect.y, rect.width, rect.height);
	}, false);
}
