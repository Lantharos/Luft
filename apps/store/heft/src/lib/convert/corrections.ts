import type { Stroke } from '#lib/ink/stroke.js';
import type { PageObject } from '#lib/page/objects.js';
import { offsetOf } from '#lib/typing/caret.js';
import { lettersOf, placeMark } from './diacritics';
import { gesture, type Gesture, type Mark } from './marks';
import { keep, languages, pointsOf, readNow } from './read';
import { rangeOver, rendered, wordsOf, type Glyph, type RenderedLine } from './rendered';

const DOTS_APART = 1.2;
const COVERED = 0.3;
const NEAREST = 3;
const LINE_MIDDLE = 0.35;
const NEAR = 0.6;

interface Read {
	strokes: Stroke[];
	baseline: number;
	found: Gesture;
	x: number;
}

export interface Corrected {
	used: Stroke[];
	insert: number | null;
}

const middle = (stroke: Stroke) => (stroke.bounds.left + stroke.bounds.right) / 2;

function lineAt(lines: RenderedLine[], baseline: number) {
	return lines.toSorted((a, b) => Math.abs(a.baseline - baseline) - Math.abs(b.baseline - baseline))[0];
}

function nearestLine(lines: RenderedLine[], stroke: Stroke, size: number) {
	return lineAt(lines, (stroke.bounds.top + stroke.bounds.bottom) / 2 + size * LINE_MIDDLE);
}

function pairDots(reads: Read[], size: number): Read[] {
	const isDot = (read: Read) => read.found.kind === 'mark' && read.found.mark === 'dot';
	const out = reads.filter((read) => !isDot(read));
	const dots = reads.filter(isDot);
	while (dots.length) {
		const dot = dots.shift()!;
		const other = dots.findIndex((candidate) => candidate.baseline === dot.baseline && Math.abs(candidate.x - dot.x) < size * DOTS_APART);
		if (other < 0) {
			out.push(dot);
			continue;
		}
		const [pair] = dots.splice(other, 1);
		out.push({ strokes: [...dot.strokes, ...pair.strokes], baseline: dot.baseline, found: { kind: 'mark', mark: 'dash' }, x: (dot.x + pair.x) / 2 });
	}
	return out;
}

function near(a: Stroke, b: Stroke, size: number) {
	const across = Math.max(a.bounds.left - b.bounds.right, b.bounds.left - a.bounds.right);
	const down = Math.max(a.bounds.top - b.bounds.bottom, b.bounds.top - a.bounds.bottom);
	return across < size * NEAR && down < size * NEAR;
}

function joinWriting(reads: Read[], size: number): Read[] {
	const pieces: Read[][] = [];
	for (const read of reads.filter((candidate) => candidate.found.kind === 'writing')) {
		const touching = pieces.filter((piece) => piece.some((other) => near(other.strokes[0], read.strokes[0], size)));
		for (const piece of touching) pieces.splice(pieces.indexOf(piece), 1);
		pieces.push([...touching.flat(), read]);
	}
	const joined = new Map<Read, number>();
	for (const piece of pieces) {
		const counts = new Map<number, number>();
		for (const read of piece) counts.set(read.baseline, (counts.get(read.baseline) ?? 0) + 1);
		const baseline = [...counts].toSorted((a, b) => b[1] - a[1])[0][0];
		for (const read of reads) if (piece.includes(read) || piece.some((other) => near(other.strokes[0], read.strokes[0], size))) joined.set(read, baseline);
	}
	return reads.map((read) => (joined.has(read) ? { ...read, baseline: joined.get(read)!, found: { kind: 'writing' } } : read));
}

function accent(line: RenderedLine, x: number, mark: Mark, letters: Set<string>) {
	const shown = line.glyphs.filter((glyph) => /\S/.test(glyph.char));
	const nearest = shown.toSorted((a, b) => Math.abs((a.left + a.right) / 2 - x) - Math.abs((b.left + b.right) / 2 - x)).slice(0, NEAREST);
	const placed = placeMark(shown.map((glyph) => glyph.char).join(''), nearest.map((glyph) => shown.indexOf(glyph)), mark, letters);
	if (!placed) return false;
	const glyph = shown[placed.index];
	glyph.node.replaceData(glyph.offset, 1, placed.letter);
	return true;
}

function covered(words: Glyph[][], left: number, right: number) {
	const middles = words.filter((word) => {
		const middle = (word[0].left + word.at(-1)!.right) / 2;
		return middle >= left && middle <= right;
	});
	if (middles.length) return middles;
	const overlap = (word: Glyph[]) => Math.min(word.at(-1)!.right, right) - Math.max(word[0].left, left);
	const most = words.toSorted((a, b) => overlap(b) - overlap(a))[0];
	return most && overlap(most) > (most.at(-1)!.right - most[0].left) * COVERED ? [most] : [];
}

function strike(box: HTMLElement, line: RenderedLine, left: number, right: number) {
	const words = covered(wordsOf(line), left, right);
	const block = line.glyphs[0].node.parentElement!.closest('div, p, li, h2, h3, blockquote');
	for (const word of words.toReversed()) {
		const [first, last] = [word[0], word.at(-1)!];
		const range = rangeOver(first, last);
		if (last.node.data[last.offset + 1] === ' ') range.setEnd(last.node, last.offset + 2);
		else if (first.node.data[first.offset - 1] === ' ') range.setStart(first.node, first.offset - 1);
		range.deleteContents();
	}
	if (block && block !== box && box.contains(block) && !block.textContent?.trim()) block.remove();
	return words.length > 0;
}

function insertionPoint(box: HTMLElement, line: RenderedLine, x: number) {
	const after = line.glyphs.find((glyph) => (glyph.left + glyph.right) / 2 > x);
	if (after) return offsetOf(box, after.node, after.offset);
	const last = line.glyphs.at(-1)!;
	return offsetOf(box, last.node, last.offset + 1);
}

function mostCovered(words: Glyph[][], count: number, left: number, right: number) {
	if (words.length <= count) return words;
	const overlap = (word: Glyph[]) => Math.max(0, Math.min(word.at(-1)!.right, right) - Math.max(word[0].left, left));
	let best = 0;
	let most = -1;
	for (let start = 0; start + count <= words.length; start++) {
		const total = words.slice(start, start + count).reduce((sum, word) => sum + overlap(word), 0);
		if (total > most) [most, best] = [total, start];
	}
	return words.slice(best, best + count);
}

async function rewrite(box: HTMLElement, object: PageObject, zoom: number, read: Read, context: string) {
	const left = Math.min(...read.strokes.map((stroke) => stroke.bounds.left));
	const right = Math.max(...read.strokes.map((stroke) => stroke.bounds.right));
	if (!covered(wordsOf(lineAt(rendered(box, object, zoom), read.baseline)), left, right).length) return false;
	const text = await readNow(read.strokes, context);
	const words = text && box.isConnected ? mostCovered(covered(wordsOf(lineAt(rendered(box, object, zoom), read.baseline)), left, right), text.split(' ').length, left, right) : [];
	if (!text || !words.length) return false;
	const range = rangeOver(words[0][0], words.at(-1)!.at(-1)!);
	const replaced = range.toString();
	range.deleteContents();
	range.insertNode(document.createTextNode(text));
	keep({ kind: 'rewrite', read: replaced, corrected: text, strokes: read.strokes.map(pointsOf) });
	return true;
}

export async function correct(box: HTMLElement, object: PageObject, strokes: Stroke[], zoom: number): Promise<Corrected> {
	const size = object.size ?? 16;
	const context = box.innerText;
	const letters = lettersOf(languages(), context);
	const used: Stroke[] = [];
	let insert: number | null = null;
	const lines = rendered(box, object, zoom);
	if (!lines.length) return { used, insert };
	const reads = joinWriting(
		strokes.map((stroke): Read => {
			const { baseline } = nearestLine(lines, stroke, size);
			return { strokes: [stroke], baseline, found: gesture(pointsOf(stroke), { baseline, size }), x: middle(stroke) };
		}),
		size
	);
	const writing = reads.filter((read) => read.found.kind === 'writing');
	for (const baseline of new Set(writing.map((read) => read.baseline))) {
		const over = writing.filter((read) => read.baseline === baseline).flatMap((read) => read.strokes);
		if (await rewrite(box, object, zoom, { strokes: over, baseline, found: { kind: 'writing' }, x: 0 }, context)) used.push(...over);
	}
	for (const read of pairDots(reads, size)) {
		const { found } = read;
		if (found.kind === 'writing') continue;
		const line = lineAt(rendered(box, object, zoom), read.baseline);
		if (!line) continue;
		const before = box.innerText;
		if (found.kind === 'insert') insert = insertionPoint(box, line, read.x);
		else if (found.kind === 'strike' ? !strike(box, line, read.strokes[0].bounds.left, read.strokes[0].bounds.right) : !accent(line, read.x, found.mark, letters)) continue;
		used.push(...read.strokes);
		if (found.kind !== 'insert') keep({ kind: found.kind === 'strike' ? 'strike' : 'accent', read: before, corrected: box.innerText, strokes: read.strokes.map(pointsOf) });
	}
	box.normalize();
	return { used, insert };
}
