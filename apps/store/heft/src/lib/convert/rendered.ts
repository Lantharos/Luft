import type { PageObject } from '#lib/page/objects.js';
import { measure } from '#lib/paper/lines.js';

/** A character of a text box as it shows on the page, in page units. */
export interface Glyph {
	node: Text;
	offset: number;
	char: string;
	left: number;
	right: number;
	top: number;
	bottom: number;
	baseline: number;
}

export interface RenderedLine {
	baseline: number;
	glyphs: Glyph[];
}

const SAME_LINE = 0.3;

/** Where every character of a text box shows, sorted into the lines it's laid out in. */
export function rendered(box: HTMLElement, object: PageObject, zoom: number): RenderedLine[] {
	const page = box.closest('[data-page]')!.getBoundingClientRect();
	const size = object.size ?? 16;
	const descent = measure(size, object.line ?? size * 1.45).descent;
	const range = document.createRange();
	const lines: RenderedLine[] = [];
	const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
		for (let offset = 0; offset < node.length; offset++) {
			range.setStart(node, offset);
			range.setEnd(node, offset + 1);
			const rect = range.getClientRects()[0];
			if (!rect) continue;
			const glyph: Glyph = {
				node,
				offset,
				char: node.data[offset],
				left: (rect.left - page.left) / zoom,
				right: (rect.right - page.left) / zoom,
				top: (rect.top - page.top) / zoom,
				bottom: (rect.bottom - page.top) / zoom,
				baseline: (rect.bottom - page.top) / zoom - descent
			};
			const line = lines.find((candidate) => Math.abs(candidate.baseline - glyph.baseline) < size * SAME_LINE);
			if (line) line.glyphs.push(glyph);
			else lines.push({ baseline: glyph.baseline, glyphs: [glyph] });
		}
	}
	for (const line of lines) line.glyphs.sort((a, b) => a.left - b.left);
	return lines.sort((a, b) => a.baseline - b.baseline);
}

/** The words of a line, as runs of glyphs between spaces. */
export function wordsOf(line: RenderedLine): Glyph[][] {
	const words: Glyph[][] = [];
	let word: Glyph[] = [];
	for (const glyph of line.glyphs) {
		if (/\s/.test(glyph.char)) {
			if (word.length) words.push(word);
			word = [];
		} else word.push(glyph);
	}
	if (word.length) words.push(word);
	return words;
}

/** A range in the box from the first glyph's start to the last one's end. */
export function rangeOver(first: Glyph, last: Glyph) {
	const range = document.createRange();
	range.setStart(first.node, first.offset);
	range.setEnd(last.node, last.offset + 1);
	return range;
}
