import { clipboard } from '@lantharos/sabine';
import { t } from '@luft/i18n';
import type { ImageDocument } from '#lib/document/image.svelte.js';
import { eraseSelection } from '#lib/document/actions.js';
import { readRegion } from '#lib/raster/readback.js';
import { uploadBitmap } from './pixels';

const PNG = 'image/png';

export async function pngOf(pixels: Uint8Array, width: number, height: number) {
	const straight = new Uint8ClampedArray(pixels.length);
	for (let at = 0; at < pixels.length; at += 4) {
		const alpha = pixels[at + 3];
		const scale = alpha ? 255 / alpha : 0;
		straight[at] = pixels[at] * scale;
		straight[at + 1] = pixels[at + 1] * scale;
		straight[at + 2] = pixels[at + 2] * scale;
		straight[at + 3] = alpha;
	}
	const canvas = new OffscreenCanvas(width, height);
	canvas.getContext('2d')!.putImageData(new ImageData(straight, width, height), 0, 0);
	return canvas.convertToBlob({ type: PNG });
}

export async function copyImage(doc: ImageDocument, merged = false) {
	const area = doc.selectionActive && doc.selectionBounds ? doc.selectionBounds : doc.bounds;
	const bounds = { x: Math.max(0, Math.floor(area.x)), y: Math.max(0, Math.floor(area.y)), width: 0, height: 0 };
	bounds.width = Math.min(doc.width, Math.ceil(area.x + area.width)) - bounds.x;
	bounds.height = Math.min(doc.height, Math.ceil(area.y + area.height)) - bounds.y;
	if (bounds.width <= 0 || bounds.height <= 0) return;
	doc.scene([1, 0, 0, 1, 0, 0]);
	const pixels = await readRegion(merged ? doc.compositor.levels[0] : doc.active.pixels, bounds);
	if (doc.selectionActive) {
		const mask = await readRegion(doc.selection, bounds);
		for (let at = 0; at < mask.length; at++) {
			const amount = mask[at] / 255;
			for (let channel = 0; channel < 4; channel++) pixels[at * 4 + channel] *= amount;
		}
	}
	await clipboard.write({ [PNG]: await pngOf(pixels, bounds.width, bounds.height) });
}

export async function cutImage(doc: ImageDocument) {
	await copyImage(doc);
	eraseSelection(doc);
}

export async function clipboardImage() {
	const data = await clipboard.read({ types: [PNG, 'image/jpeg', 'image/webp'] });
	const entry = Object.entries(data).find(([type]) => type.startsWith('image/'));
	if (!entry || typeof entry[1] === 'string') return null;
	return createImageBitmap(new Blob([entry[1] as Uint8Array<ArrayBuffer>], { type: entry[0] }), { premultiplyAlpha: 'premultiply' });
}

export async function pasteImage(doc: ImageDocument, at: [number, number]) {
	const bitmap = await clipboardImage();
	if (!bitmap) return false;
	const layer = doc.newLayer('raster', t('easel-layer-pasted'));
	const [x, y] = doc.selectionActive && doc.selectionBounds ? [doc.selectionBounds.x, doc.selectionBounds.y] : [at[0] - bitmap.width / 2, at[1] - bitmap.height / 2];
	const left = Math.round(Math.max(0, Math.min(doc.width - bitmap.width, x)));
	const top = Math.round(Math.max(0, Math.min(doc.height - bitmap.height, y)));
	const visible = await createImageBitmap(bitmap, 0, 0, Math.min(bitmap.width, doc.width), Math.min(bitmap.height, doc.height), { premultiplyAlpha: 'premultiply' });
	uploadBitmap(layer.pixels, visible, left, top);
	visible.close();
	bitmap.close();
	const index = doc.layers.indexOf(doc.active) + 1;
	doc.setLayers(t('easel-history-paste'), [...doc.layers.slice(0, index), layer, ...doc.layers.slice(index)], layer.id);
	return true;
}
