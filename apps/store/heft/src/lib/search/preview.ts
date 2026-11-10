import type { Attachment } from 'svelte/attachments';
import { library } from '#lib/library/library.svelte.js';
import { pageSize, paperOf } from '#lib/library/model.js';
import type { PageDocument } from '#lib/page/document.js';
import { pdfImage } from '#lib/pdf/render.js';
import { sourcePath } from '#lib/pdf/sources.js';
import { pageText } from '#lib/pdf/text.js';
import { paintThumbnail } from '#lib/rail/thumbnail.js';
import { fold, type Box, type Hit } from './index.svelte';

const WIDTH = 60;
const SMALLEST = 3;
const pages = new Map<string, Promise<ImageBitmap>>();

function typedBoxes(document: PageDocument, offset: number): Box[] {
	const texts = document.objects.map((object) => object.text ?? '');
	const joined = texts.join('\n');
	const position = offset + joined.length - joined.trimStart().length;
	let start = 0;
	for (const [index, object] of document.objects.entries()) {
		const end = start + texts[index].length;
		if (texts[index] && position <= end) return [{ left: object.x, top: object.y, width: object.width, height: object.height }];
		start = end + 1;
	}
	return [];
}

async function bookBoxes(path: string, index: number, needle: string): Promise<Box[]> {
	const glyphs = await pageText(path, index);
	let text = '';
	const starts = glyphs.map((glyph) => {
		const start = text.length;
		text += fold(glyph.text) + ' ';
		return start;
	});
	const at = text.indexOf(needle);
	if (at < 0) return [];
	return glyphs.flatMap((glyph, number) => {
		const from = Math.max(at, starts[number]);
		const to = Math.min(at + needle.length, starts[number] + glyph.text.length);
		if (from >= to) return [];
		const share = (offset: number) => (offset - starts[number]) / glyph.text.length;
		return [{ left: glyph.left + glyph.width * share(from), top: glyph.top, width: glyph.width * (share(to) - share(from)), height: glyph.height }];
	});
}

function pagePicture(hit: Hit, pixels: number, height: number): Promise<ImageBitmap> {
	const entry = hit.notebook.meta.pages[hit.index];
	const notebook = library.openNotebook(hit.notebook);
	const key = `${entry.id}:${notebook.revisions.get(entry.id) ?? 0}:${pixels}`;
	let picture = pages.get(key);
	if (!picture) {
		picture = (async () => {
			const paper = paperOf(hit.notebook.meta, entry);
			const canvas = document.createElement('canvas');
			canvas.width = pixels;
			canvas.height = height;
			const [store, background] = await Promise.all([notebook.load(entry.id), entry.pdf ? pdfImage(sourcePath(notebook, entry.pdf.source), entry.pdf.index, pixels) : undefined]);
			paintThumbnail(canvas, paper, pageSize(paper, entry), store.document, background);
			return createImageBitmap(canvas);
		})();
		pages.set(key, picture);
	}
	return picture;
}

async function boxes(hit: Hit, needle: string): Promise<Box[]> {
	const entry = hit.notebook.meta.pages[hit.index];
	const notebook = library.openNotebook(hit.notebook);
	if (hit.box) return [hit.box];
	if (hit.kind === 'said') return [];
	if (hit.kind === 'book' && entry.pdf) return bookBoxes(sourcePath(notebook, entry.pdf.source), entry.pdf.index, needle);
	return typedBoxes((await notebook.load(entry.id)).document, hit.offset);
}

export function hitPreview(hit: Hit, query: string): Attachment<HTMLElement> {
	return (element) => {
		const entry = hit.notebook.meta.pages[hit.index];
		const size = pageSize(paperOf(hit.notebook.meta, entry), entry);
		const height = Math.round((WIDTH * size.height) / size.width);
		const scale = devicePixelRatio;
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(WIDTH * scale);
		canvas.height = Math.round(height * scale);
		canvas.style.cssText = `display:block;width:${WIDTH}px;height:${height}px;border-radius:4px;box-shadow:0 0 0 1px var(--hairline)`;
		element.append(canvas);
		let alive = true;
		void Promise.all([pagePicture(hit, canvas.width, canvas.height), boxes(hit, fold(query.trim()))]).then(([picture, marks]) => {
			if (!alive) return;
			const context = canvas.getContext('2d')!;
			context.drawImage(picture, 0, 0);
			const ratio = canvas.width / size.width;
			context.fillStyle = getComputedStyle(element).getPropertyValue('--accent') || '#3d7bd9';
			context.globalAlpha = 0.45;
			for (const mark of marks) {
				const width = Math.max(SMALLEST, mark.width * ratio);
				const tall = Math.max(SMALLEST, mark.height * ratio);
				context.fillRect(mark.left * ratio, mark.top * ratio, width, tall);
			}
		});
		return () => {
			alive = false;
			canvas.remove();
		};
	};
}
