import { emptyBounds, POINT_FIELDS, union, type Stroke } from '#lib/ink/stroke.js';
import type { Box } from '#lib/search/index.svelte.js';

export interface WrittenLine {
	strokes: [number, number][][];
	ids: string[];
	box: Box;
}

const DRAWING = 5;
const RULED = 6;
const MARK = 0.5;
const OVERLAP = 0.4;
const MARK_REACH = 1.5;
const COLUMN_GAP = 9;
const STRAY = 2;
const SMALL = 0.8;

const height = (stroke: Stroke) => stroke.bounds.bottom - stroke.bounds.top;
const width = (stroke: Stroke) => stroke.bounds.right - stroke.bounds.left;
const middle = (stroke: Stroke) => (stroke.bounds.top + stroke.bounds.bottom) / 2;

interface Row {
	top: number;
	bottom: number;
	strokes: Stroke[];
}

function median(values: number[]) {
	const sorted = values.toSorted((a, b) => a - b);
	return sorted[sorted.length >> 1] ?? 0;
}

function line(strokes: Stroke[]): WrittenLine {
	const bounds = emptyBounds();
	for (const stroke of strokes) union(bounds, stroke.bounds);
	return {
		strokes: strokes.map((stroke) => {
			const points: [number, number][] = [];
			for (let index = 0; index < stroke.points.length; index += POINT_FIELDS) points.push([stroke.points[index], stroke.points[index + 1]]);
			return points;
		}),
		ids: strokes.map((stroke) => stroke.id),
		box: { left: bounds.left, top: bounds.top, width: bounds.right - bounds.left, height: bounds.bottom - bounds.top }
	};
}

function overlap(row: Row, stroke: Stroke) {
	return Math.min(row.bottom, stroke.bounds.bottom) - Math.max(row.top, stroke.bounds.top);
}

/**
 * Letters go to the row they overlap most; dots and accents to the row
 * nearest them, as do one or two small strokes left in a row of their own,
 * such as an accent over a capital that came out as tall as a letter.
 */
function rows(letters: Stroke[], marks: Stroke[], letter: number): Row[] {
	const found: Row[] = [];
	for (const stroke of letters.toSorted((a, b) => a.bounds.top - b.bounds.top)) {
		const row = found.toSorted((a, b) => overlap(b, stroke) - overlap(a, stroke))[0];
		if (row && overlap(row, stroke) > OVERLAP * Math.min(height(stroke), row.bottom - row.top)) {
			row.strokes.push(stroke);
			row.top = Math.min(row.top, stroke.bounds.top);
			row.bottom = Math.max(row.bottom, stroke.bounds.bottom);
		} else found.push({ top: stroke.bounds.top, bottom: stroke.bounds.bottom, strokes: [stroke] });
	}
	const strays = found.filter((row) => row.strokes.length <= STRAY && row.strokes.every((stroke) => height(stroke) < letter * SMALL));
	if (strays.length < found.length) {
		for (const row of strays) found.splice(found.indexOf(row), 1);
		marks = [...marks, ...strays.flatMap((row) => row.strokes)];
	}
	for (const mark of marks) {
		const distance = (row: Row) => Math.max(row.top - middle(mark), middle(mark) - row.bottom, 0);
		const row = found.toSorted((a, b) => distance(a) - distance(b))[0];
		if (row && distance(row) < letter * MARK_REACH) row.strokes.push(mark);
		else found.push({ top: mark.bounds.top, bottom: mark.bounds.bottom, strokes: [mark] });
	}
	return found.toSorted((a, b) => a.top - b.top);
}

/**
 * Sorts a page's pen strokes into lines of writing, the way they'd be read:
 * letters that share a band of height, split where a wide gap starts another
 * column. Strokes far taller than the writing are drawings, and long flat
 * ones are rules and underlines.
 */
export function writtenLines(strokes: Stroke[]): WrittenLine[] {
	const pens = strokes.filter((stroke) => stroke.tool === 'pen');
	const letter = Math.max(4, median(pens.map(height)));
	const writing = pens.filter((stroke) => height(stroke) < letter * DRAWING && !(width(stroke) > letter * RULED && height(stroke) < letter * MARK));
	const letters = writing.filter((stroke) => height(stroke) >= letter * MARK);
	const marks = writing.filter((stroke) => height(stroke) < letter * MARK);
	return rows(letters, marks, letter).flatMap((row) => {
		const pieces: Stroke[][] = [];
		let right = -Infinity;
		for (const stroke of row.strokes.toSorted((a, b) => a.bounds.left - b.bounds.left)) {
			if (stroke.bounds.left - right > letter * COLUMN_GAP || !pieces.length) pieces.push([]);
			pieces.at(-1)!.push(stroke);
			right = Math.max(right, stroke.bounds.right);
		}
		return pieces.map(line);
	});
}

/** A short name for exactly this set of pen strokes. */
export function inkPrint(strokes: Stroke[]) {
	let hash = 0x811c9dc5;
	for (const id of strokes.filter((stroke) => stroke.tool === 'pen').map((stroke) => stroke.id).sort()) {
		for (let index = 0; index < id.length; index++) hash = Math.imul(hash ^ id.charCodeAt(index), 0x01000193);
		hash = Math.imul(hash ^ 0x2c, 0x01000193);
	}
	return (hash >>> 0).toString(36);
}
