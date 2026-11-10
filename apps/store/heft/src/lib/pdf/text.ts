import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { pdfDocument, PAGE_UNITS_PER_POINT } from './document';

export interface Glyphs {
	text: string;
	left: number;
	top: number;
	width: number;
	height: number;
}

const cache = new Map<string, Promise<Glyphs[]>>();

export function pageText(path: string, index: number): Promise<Glyphs[]> {
	const key = `${path}#${index}`;
	let pending = cache.get(key);
	if (!pending) {
		pending = (async () => {
			const page = await (await pdfDocument(path)).getPage(index + 1);
			const viewport = page.getViewport({ scale: PAGE_UNITS_PER_POINT });
			const content = await page.getTextContent();
			return content.items
				.filter((item): item is TextItem => 'str' in item && item.str.trim().length > 0)
				.map((item) => {
					const [a, b, , , e, f] = item.transform;
					const [x, y] = viewport.convertToViewportPoint(e, f);
					const height = Math.hypot(a, b) * PAGE_UNITS_PER_POINT;
					return { text: item.str, left: x, top: y - height * 0.86, width: item.width * PAGE_UNITS_PER_POINT, height: height * 1.12 };
				});
		})();
		cache.set(key, pending);
	}
	return pending;
}

export interface Selection {
	rects: { left: number; top: number; width: number; height: number }[];
	text: string;
}

function nearest(glyphs: Glyphs[], x: number, y: number): number {
	let best = 0;
	let distance = Infinity;
	glyphs.forEach((glyph, index) => {
		const dx = Math.max(glyph.left - x, 0, x - glyph.left - glyph.width);
		const dy = Math.max(glyph.top - y, 0, y - glyph.top - glyph.height);
		const away = dx + dy * 3;
		if (away < distance) {
			distance = away;
			best = index;
		}
	});
	return best;
}

const share = (glyph: Glyphs, x: number) => Math.max(0, Math.min(1, (x - glyph.left) / glyph.width));

export function select(glyphs: Glyphs[], from: [number, number], to: [number, number]): Selection {
	if (!glyphs.length) return { rects: [], text: '' };
	let start = nearest(glyphs, ...from);
	let end = nearest(glyphs, ...to);
	let [startX, endX] = [from[0], to[0]];
	if (start > end || (start === end && startX > endX)) {
		[start, end] = [end, start];
		[startX, endX] = [endX, startX];
	}
	const rects: Selection['rects'] = [];
	const pieces: string[] = [];
	for (let index = start; index <= end; index++) {
		const glyph = glyphs[index];
		const begin = index === start ? share(glyph, startX) : 0;
		const finish = index === end ? share(glyph, endX) : 1;
		if (finish <= begin) continue;
		const chars = glyph.text.length;
		pieces.push(glyph.text.slice(Math.floor(begin * chars), Math.ceil(finish * chars)));
		const rect = { left: glyph.left + glyph.width * begin, top: glyph.top, width: glyph.width * (finish - begin), height: glyph.height };
		const line = rects.at(-1);
		if (line && Math.abs(line.top - rect.top) < rect.height / 2 && rect.left - (line.left + line.width) < rect.height * 1.5) {
			line.width = Math.max(line.width, rect.left + rect.width - line.left);
		} else rects.push(rect);
	}
	return { rects, text: pieces.join(' ').replace(/\s+/g, ' ').trim() };
}
