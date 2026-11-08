import { readOutside, replaceFile } from '#lib/bridge/files.js';
import { commands } from '#lib/bindings.js';
import { newId } from '#lib/ink/stroke.js';
import type { PageDocument } from '#lib/page/document.js';
import type { PageObject } from '#lib/page/objects.js';

const TEXT_WIDTH = 300;
const PICTURE_SHARE = 0.6;

/** The text box that should take the cursor as soon as it shows, and the picture to crop as soon as it shows. */
class Editing {
	focus: string | null = $state(null);
	crop: string | null = $state(null);
}

export const editing = new Editing();

export function addText(document: PageDocument, x: number, y: number, pageWidth: number, html = '') {
	const object: PageObject = { id: newId(), kind: 'text', x, y, width: Math.min(TEXT_WIDTH, pageWidth - x - 16), height: 24, html, text: '' };
	document.commit({ removed: [], added: [], objects: [{ before: null, after: object }] });
	editing.focus = object.id;
	return object;
}

/** Book text set on a page as a quote, at a place or under what's already there. */
export function addQuote(document: PageDocument, pageWidth: number, text: string, at?: { x: number; y: number }) {
	const y = at?.y ?? Math.max(48, ...document.objects.map((object) => object.y + object.height + 12));
	const escaped = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
	return addText(document, at?.x ?? 40, y, pageWidth, `<blockquote>${escaped}</blockquote>`);
}

function size(bytes: Uint8Array): Promise<{ width: number; height: number }> {
	const url = URL.createObjectURL(new Blob([bytes as BlobPart]));
	const image = new Image();
	image.src = url;
	return image.decode().then(
		() => {
			URL.revokeObjectURL(url);
			return { width: image.naturalWidth, height: image.naturalHeight };
		},
		() => ({ width: 0, height: 0 })
	);
}

const extension = (name: string) => (name.match(/\.(png|jpe?g|webp|gif|avif)$/i)?.[1] ?? 'png').toLowerCase();

/**
 * Copies a picture into the notebook and places it on the page: where asked
 * and as wide as asked, or scaled to fit near the top.
 */
export async function addPicture(document: PageDocument, folder: string, page: { width: number; height: number }, bytes: Uint8Array, name: string, at?: { x: number; y: number; width: number }) {
	const natural = await size(bytes);
	if (!natural.width) return null;
	const asset = `${newId()}.${extension(name)}`;
	await replaceFile(`${folder}/assets/${asset}`, bytes);
	const width = at?.width ?? Math.min(natural.width, page.width * PICTURE_SHARE);
	const height = (natural.height * width) / natural.width;
	const x = at?.x ?? (page.width - width) / 2;
	const y = at?.y ?? Math.max(24, (page.height - height) / 3);
	const object: PageObject = { id: newId(), kind: 'image', x, y, width, height, asset };
	document.commit({ removed: [], added: [], objects: [{ before: null, after: object }] });
	return object;
}

export async function addPictureFiles(document: PageDocument, folder: string, page: { width: number; height: number }, paths: string[]) {
	for (const path of paths) await addPicture(document, folder, page, await readOutside(path), path);
}

export const choosePictures = (title: string, filter: string) => commands.chooseFiles({ kind: 'image', title, filter });
