import { writtenLines, type WrittenLine } from '#lib/handwriting/lines.js';
import { newId, type Stroke } from '#lib/ink/stroke.js';
import type { PageDocument } from '#lib/page/document.js';
import { cleanHtml, type PageObject } from '#lib/page/objects.js';
import { measure, nearestBaseline, widthFrom, type TextLines } from '#lib/paper/lines.js';
import { pointAt } from '#lib/typing/caret.js';
import { glyphs } from './align';
import { readNow } from './read';
import { rendered } from './rendered';

const FULL_LINE = 0.7;
const SAME_COLUMN = 3;
const LETTER_BOTTOMS = 0.6;

export interface Page {
	id: string;
	document: PageDocument;
	element: HTMLElement;
	width: number;
	lines: TextLines;
	zoom: number;
}

export interface Insertion {
	object: string;
	offset: number;
}

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

/** Where the letters of a line sit: most letters end on the baseline, a few hang below it. */
function baselineOf(strokes: Stroke[]) {
	const bottoms = strokes.map((stroke) => stroke.bounds.bottom).toSorted((a, b) => a - b);
	return bottoms[Math.floor((bottoms.length - 1) * LETTER_BOTTOMS)];
}

const boxOf = (page: Page, id: string) => page.element.querySelector<HTMLElement>(`[data-object="${id}"]`);

/** Puts text into a box that's on the page: at a point in it, or at its end on the same line or the next. */
function into(page: Page, object: PageObject, text: string, at: number | 'end' | 'next') {
	const box = boxOf(page, object.id);
	if (!box) return null;
	if (at === 'next') {
		const line = document.createElement('div');
		line.textContent = text;
		box.append(line);
	} else {
		const [node, offset] = at === 'end' ? pointAt(box, Infinity) : pointAt(box, at);
		const before = node.textContent?.[offset - 1];
		const after = node.textContent?.[offset];
		const spaced = `${before && before !== ' ' ? ' ' : ''}${text}${after && after !== ' ' ? ' ' : ''}`;
		if (node instanceof Text) node.insertData(offset, spaced);
		else node.appendChild(document.createTextNode(spaced));
	}
	return { ...object, html: cleanHtml(box.innerHTML), text: box.innerText.trim(), height: box.offsetHeight };
}

/**
 * Where a line goes among the text already on the page: onto the end of the
 * box ending on the same line before it, or on the line above in the same
 * column; on paper of its own when it's clear of other text; or nowhere,
 * staying ink, when it was written over text it couldn't replace.
 */
function placeAmong(page: Page, line: WrittenLine, baseline: number): { object: PageObject; at: 'end' | 'next' } | 'new' | null {
	const { step, size } = page.lines;
	const right = line.box.left + line.box.width;
	let clear = true;
	for (const object of page.document.objects) {
		if (object.kind !== 'text') continue;
		const box = boxOf(page, object.id);
		const lines = box ? rendered(box, object, page.zoom) : [];
		const last = lines.at(-1);
		const end = last?.glyphs.at(-1);
		if (!last || !end) continue;
		if (object.line !== undefined && Math.abs(last.baseline - baseline) < step / 2 && line.box.left >= end.left - size) return { object, at: 'end' };
		if (object.line !== undefined && Math.abs(last.baseline + step - baseline) < step / 2 && Math.abs(line.box.left - object.x) < SAME_COLUMN * size) {
			return { object, at: end.right > object.x + object.width * FULL_LINE ? 'end' : 'next' };
		}
		const over = lines.some((shown) => Math.abs(shown.baseline - baseline) < step / 2 && shown.glyphs[0].left < right && shown.glyphs.at(-1)!.right > line.box.left);
		if (over) clear = false;
	}
	return clear ? 'new' : null;
}

function newBox(page: Page, line: WrittenLine, baseline: number, text: string): PageObject {
	const { lines } = page;
	const x = Math.max(0, line.box.left - 4);
	return {
		id: newId(),
		kind: 'text',
		x,
		y: nearestBaseline(lines, baseline) - measure(lines.size, lines.step).baseline,
		width: widthFrom(x, page.width),
		height: lines.step,
		html: `<div>${escape(text)}</div>`,
		text,
		line: lines.step,
		size: lines.size,
		written: [],
		typedAt: Math.min(...line.ids.map((id) => page.document.get(id)?.started ?? Date.now()))
	};
}

/**
 * Turns handwritten lines into typed text where they were written, line by
 * line: the lines written right after a mark go where it asked, the others
 * onto the end of text they carry on, or as new text on the paper's lines.
 * Each line's ink goes in the same change that adds its text, so undoing
 * brings the handwriting back.
 */
export async function convert(page: Page, strokes: Stroke[], insertion: Insertion | null) {
	let pending = insertion;
	for (const line of writtenLines(strokes)) {
		const ink = line.ids.map((id) => page.document.get(id)).filter((stroke) => stroke !== undefined);
		const text = await readNow(ink, page.document.objects.map((object) => object.text ?? '').join(' '));
		if (!text || ink.some((stroke) => !page.document.get(stroke.id))) continue;
		const baseline = baselineOf(ink);
		const target = pending ? page.document.object(pending.object) : undefined;
		let existing = target;
		let at: number | 'end' | 'next' = pending?.offset ?? 'end';
		if (!target) {
			const place = placeAmong(page, line, baseline);
			if (!place) continue;
			if (place !== 'new') ({ object: existing, at } = place);
		}
		const after = existing ? into(page, existing, text, at) : newBox(page, line, baseline, text);
		if (!after) continue;
		after.written = [...(existing?.written ?? []), { text, glyphs: glyphs(ink.map((stroke) => stroke.bounds), text) }];
		page.document.commit({ removed: ink, added: [], objects: [{ before: existing ?? null, after }] });
		if (target) pending = { object: target.id, offset: pending!.offset + text.length + 1 };
	}
}
