import type { Bounds } from '#lib/ink/stroke.js';

const NARROW = new Set([...'iIjlrtf.,;:!\'|()1']);
const WIDE = new Set([...'mwMWŠŽ']);

const widthOf = (letter: string) => (NARROW.has(letter) ? 0.5 : WIDE.has(letter) ? 1.5 : 1);

/** Strokes that overlap side by side become one run of ink, as joined-up letters do. */
function runs(strokes: Bounds[]): Bounds[] {
	const found: Bounds[] = [];
	for (const stroke of strokes.toSorted((a, b) => a.left - b.left)) {
		const last = found.at(-1);
		if (last && stroke.left <= last.right) {
			last.right = Math.max(last.right, stroke.right);
			last.top = Math.min(last.top, stroke.top);
			last.bottom = Math.max(last.bottom, stroke.bottom);
		} else found.push({ ...stroke });
	}
	return found;
}

/** Groups runs into `count` words, split at the widest gaps between them. */
function words(found: Bounds[], count: number): Bounds[] {
	const cuts = found
		.slice(1)
		.map((run, index) => ({ index: index + 1, gap: run.left - found[index].right }))
		.toSorted((a, b) => b.gap - a.gap)
		.slice(0, count - 1)
		.map((cut) => cut.index)
		.toSorted((a, b) => a - b);
	return [0, ...cuts].map((start, index) => {
		const part = found.slice(start, cuts[index] ?? found.length);
		return {
			left: part[0].left,
			right: part.at(-1)!.right,
			top: Math.min(...part.map((run) => run.top)),
			bottom: Math.max(...part.map((run) => run.bottom))
		};
	});
}

/**
 * Where each character of a line read from handwriting was written: the
 * line's ink is split into as many words as were read at its widest gaps,
 * and each word's width is shared among its letters by how wide they tend to
 * be. Four numbers a character, left, top, right and bottom; spaces get the
 * gap between their words.
 */
export function glyphs(strokes: Bounds[], text: string): number[] {
	const said = text.split(' ');
	const found = runs(strokes);
	if (!found.length) return [];
	const boxes = found.length >= said.length ? words(found, said.length) : said.map(() => words(found, 1)[0]);
	const out: number[] = [];
	const round = (value: number) => Math.round(value * 10) / 10;
	said.forEach((word, index) => {
		const box = boxes[index];
		const letters = [...word];
		const total = letters.reduce((sum, letter) => sum + widthOf(letter), 0) || 1;
		let x = box.left;
		for (const letter of letters) {
			const right = x + ((box.right - box.left) * widthOf(letter)) / total;
			out.push(round(x), round(box.top), round(right), round(box.bottom));
			x = right;
		}
		const next = boxes[index + 1];
		if (next) out.push(round(box.right), round(box.top), round(next.left), round(box.bottom));
	});
	return out;
}
