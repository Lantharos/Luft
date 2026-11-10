import { readOutside, replaceFile } from '#lib/bridge/files.js';
import { commands } from '#lib/bindings.js';
import { newId } from '#lib/ink/stroke.js';
import type { PageDocument } from '#lib/page/document.js';
import type { PageObject } from '#lib/page/objects.js';
import { baselineAt, measure, widthFrom, type TextLines } from '#lib/paper/lines.js';

const TEXT_WIDTH = 300;
const PICTURE_SHARE = 0.6;

export interface FocusRequest {
	id: string;
	at?: [number, number];
	offset?: number;
}

export interface Aim {
	page: string;
	x: number;
	y: number;
	height: number;
	type(): void;
}

class Editing {
	focus: FocusRequest | null = $state(null);
	active: string | null = $state(null);
	draft: { page: string; object: PageObject } | null = $state.raw(null);
	aim: Aim | null = $state.raw(null);
	crop: string | null = $state(null);
}

export const editing = new Editing();

function addText(document: PageDocument, x: number, y: number, pageWidth: number, html = '') {
	const object: PageObject = { id: newId(), kind: 'text', x, y, width: Math.min(TEXT_WIDTH, pageWidth - x - 16), height: 24, html, text: '' };
	document.commit({ removed: [], added: [], objects: [{ before: null, after: object }] });
	editing.focus = { id: object.id };
	return object;
}

export function draftPlace(lines: TextLines, x: number, y: number) {
	const left = lines.margin && x < lines.margin + 8 ? lines.margin : Math.max(0, x - 4);
	return { left, top: baselineAt(lines, y) - measure(lines.size, lines.step).baseline };
}

export function draftText(page: string, lines: TextLines, x: number, y: number, pageWidth: number, flow = false) {
	const { left, top } = draftPlace(lines, x, y);
	const object: PageObject = { id: newId(), kind: 'text', x: left, y: top, width: widthFrom(left, pageWidth), height: lines.step, html: '', text: '', line: lines.step, size: lines.size, ...(flow ? { flow } : {}) };
	editing.draft = { page, object };
	editing.focus = { id: object.id };
}

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
