import type { Viewport } from '#lib/canvas/viewport.svelte.js';
import { MM, pageSize, paperOf, type PageEntry } from '#lib/library/model.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { editing } from '#lib/objects/editing.svelte.js';
import { newId } from '#lib/ink/stroke.js';
import { cleanHtml, type PageObject } from '#lib/page/objects.js';
import { FREE_LINES, measure, textLines, widthFrom, type TextLines } from '#lib/paper/lines.js';
import { caretOffset, offsetOf } from './caret';

const BOTTOM_MARGIN = 14 * MM;
const BLOCKS = new Set(['DIV', 'P', 'UL', 'OL', 'H2', 'H3', 'BLOCKQUOTE']);

export interface Pages {
	notebook: OpenNotebook;
	viewport: Viewport;
}

export function linesOf(notebook: OpenNotebook, entry: PageEntry): TextLines {
	if (entry.pdf) return FREE_LINES;
	const paper = paperOf(notebook.meta, entry);
	return textLines(paper, pageSize(paper, entry).height);
}

function blocks(box: HTMLElement): HTMLElement[] {
	let loose: HTMLElement | null = null;
	for (const node of [...box.childNodes]) {
		if (node instanceof HTMLElement && BLOCKS.has(node.tagName)) {
			loose = null;
			continue;
		}
		if (!loose) {
			loose = document.createElement('div');
			box.insertBefore(loose, node);
		}
		loose.append(node);
	}
	return [...box.children] as HTMLElement[];
}

function flowBox(notebook: OpenNotebook, entry: PageEntry, objects: PageObject[], like: PageObject): { object: PageObject; created: boolean } {
	const found = objects.find((object) => object.flow);
	if (found) return { object: found, created: false };
	const lines = linesOf(notebook, entry);
	const width = pageSize(paperOf(notebook.meta, entry), entry).width;
	const object: PageObject = {
		id: newId(),
		kind: 'text',
		x: like.x,
		y: lines.first - measure(lines.size, lines.step).baseline,
		width: widthFrom(like.x, width),
		height: lines.step,
		html: '',
		text: '',
		line: lines.step,
		size: lines.size,
		flow: true
	};
	return { object, created: true };
}

export async function overflow({ notebook, viewport }: Pages, page: string, object: PageObject, box: HTMLElement) {
	const index = notebook.indexOf(page);
	const entry = notebook.meta.pages[index];
	const limit = pageSize(paperOf(notebook.meta, entry), entry).height - BOTTOM_MARGIN - object.y;
	const store = await notebook.load(page);
	if (box.offsetHeight <= limit || !store.document.object(object.id)) return;
	const lines = blocks(box);
	const first = lines.findIndex((line) => line.offsetTop + line.offsetHeight > limit);
	if (first <= 0) return;
	const caret = caretOffset(box);
	const start = offsetOf(box, lines[first], 0);
	const moving = document.createElement('div');
	moving.append(...lines.slice(first));
	store.document.commit({ removed: [], added: [], objects: [{ before: object, after: { ...object, html: cleanHtml(box.innerHTML), text: box.innerText.trim(), height: box.offsetHeight } }] });
	const following = notebook.meta.pages[index + 1];
	const free = following && !following.pdf && (await notebook.load(following.id)).document;
	const next = free && (free.objects.some((other) => other.flow) || (!free.objects.length && !free.strokes.length)) ? following : notebook.addPage(index + 1);
	const target = (await notebook.load(next.id)).document;
	const { object: into, created } = flowBox(notebook, next, target.objects, object);
	const html = cleanHtml(moving.innerHTML + (into.html ?? ''));
	moving.innerHTML = html;
	target.commit({ removed: [], added: [], objects: [{ before: created ? null : into, after: { ...into, html, text: [...moving.children].map((line) => line.textContent).join('\n').trim() } }] });
	if (caret === null || caret < start) return;
	editing.focus = { id: into.id, offset: caret - start };
	viewport.showPage(index + 1);
}
