import { fileUrl } from '@lantharos/sabine';
import { t } from '@luft/i18n';
import { commands } from '#lib/bindings.js';
import { ImageDocument } from '#lib/document/image.svelte.js';
import { fetchBytes, uploadBitmap, uploadImage } from './pixels';

const BROWSER_DECODES = new Set(['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'bmp']);
export const MAX_SIDE = 16384;

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

function finish(doc: ImageDocument, layer: ImageDocument['layers'][number]) {
	doc.layers = [layer];
	doc.activeId = layer.id;
	doc.invalidate();
	return doc;
}
