import { fileUrl } from '@lantharos/sabine';
import { t } from '@luft/i18n';
import { commands } from '#lib/bindings.js';
import { AS_SHOT, RawDevelopment, uploadLinear } from '#lib/adjust/develop.js';
import { ImageDocument } from '#lib/document/image.svelte.js';
import type { BlendMode } from '#lib/gpu/shaders/blend.js';
import { fetchBytes, uploadBitmap, uploadImage } from './pixels';

const BROWSER_DECODES = new Set(['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'bmp']);
export const MAX_SIDE = 16384;
const PDF_PREVIEW_SIDE = 576;
export const RAW = new Set(['3fr', 'arw', 'cr2', 'cr3', 'crw', 'dng', 'erf', 'iiq', 'nef', 'orf', 'pef', 'raf', 'rw2']);

export const extension = (path: string) => path.split('.').pop()!.toLowerCase();
export const baseName = (path: string) => path.split('/').pop()!.replace(/\.[^.]+$/, '');

export async function decodeBlob(blob: Blob) {
	return createImageBitmap(blob, { premultiplyAlpha: 'premultiply', imageOrientation: 'from-image', colorSpaceConversion: 'default' });
}

function tooLarge(width: number, height: number) {
	if (width > MAX_SIDE || height > MAX_SIDE) throw new Error(t('easel-error-too-large', { size: MAX_SIDE }));
}

export async function pictureDocument(path: string) {
	if (BROWSER_DECODES.has(extension(path))) {
		const response = await fetch(fileUrl(path));
		const bitmap = await decodeBlob(await response.blob());
		tooLarge(bitmap.width, bitmap.height);
		const doc = new ImageDocument(bitmap.width, bitmap.height);
		const layer = doc.newLayer('raster', baseName(path));
		uploadBitmap(layer.pixels, bitmap);
		bitmap.close();
		return finish(doc, layer);
	}
	const decoded = await commands.decodePicture({ path });
	tooLarge(decoded.width, decoded.height);
	const doc = new ImageDocument(decoded.width, decoded.height);
	const layer = doc.newLayer('raster', baseName(path));
	uploadImage(layer.pixels, await fetchBytes(decoded.file), decoded.width, decoded.height);
	await commands.releaseFiles({ paths: [decoded.file] });
	return finish(doc, layer);
}

export async function layeredDocument(path: string) {
	const layered = await commands.openLayered({ path });
	tooLarge(layered.width, layered.height);
	const doc = new ImageDocument(layered.width, layered.height);
	const layers = [];
	for (const entry of layered.layers) {
		const layer = doc.newLayer('raster', entry.name || baseName(path));
		layer.opacity = entry.opacity;
		layer.visible = entry.visible;
		layer.blend = entry.blend as BlendMode;
		uploadImage(layer.pixels, await fetchBytes(entry.file), layered.width, layered.height);
		layers.push(layer);
	}
	await commands.releaseFiles({ paths: layered.layers.map((entry) => entry.file) });
	doc.layers = layers;
	doc.activeId = layers[layers.length - 1].id;
	doc.invalidate();
	return doc;
}

export async function pdfDocument(path: string, page: number) {
	const decoded = await commands.renderPdfPage({ path, page, longest: MAX_SIDE });
	const doc = new ImageDocument(decoded.width, decoded.height);
	const paper = doc.newLayer('raster', t('easel-pdf-page', { number: page + 1 }));
	uploadImage(paper.pixels, await fetchBytes(decoded.file), decoded.width, decoded.height);
	await commands.releaseFiles({ paths: [decoded.file] });
	const ink = doc.newLayer('raster', t('easel-layer-name', { number: 1 }));
	doc.layers = [paper, ink];
	doc.activeId = ink.id;
	doc.invalidate();
	return doc;
}

export async function pdfPreview(path: string, page: number) {
	const decoded = await commands.renderPdfPage({ path, page, longest: PDF_PREVIEW_SIDE });
	const bytes = await fetchBytes(decoded.file);
	await commands.releaseFiles({ paths: [decoded.file] });
	return new ImageData(new Uint8ClampedArray(bytes.buffer), decoded.width, decoded.height);
}

export async function rawDocument(path: string) {
	const decoded = await commands.decodeRaw({ path });
	tooLarge(decoded.width, decoded.height);
	const linear = uploadLinear(await fetchBytes(decoded.file), decoded.width, decoded.height);
	await commands.releaseFiles({ paths: [decoded.file] });
	const doc = new ImageDocument(decoded.width, decoded.height);
	const layer = doc.newLayer('raster', baseName(path));
	finish(doc, layer);
	const development = new RawDevelopment(doc, layer, linear);
	development.update(AS_SHOT);
	return development;
}

function finish(doc: ImageDocument, layer: ImageDocument['layers'][number]) {
	doc.layers = [layer];
	doc.activeId = layer.id;
	doc.invalidate();
	return doc;
}
