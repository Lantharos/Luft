import { bytes } from '@luft/ui';
import type { Rect } from './squarify';
import type { Tile } from './tiles';

export const NAME_FONT = '500 12.5px "Open Runde", sans-serif';
export const SIZE_FONT = '400 11.5px "Open Runde", sans-serif';
export const PADDING = 10;
export const FIRST_LINE = 19;
export const LINE = 16;

const SIZE_LINE = 17;
const BELOW_LAST_LINE = 11;
const BOTTOM_ROOM = 20;
const INLINE_GAP = 10;
const SMALLEST_NAME = 24;
const MOST_LINES = 2;

export interface Label {
	lines: string[];
	size: { text: string; x: number; y: number } | null;
	height: number;
}

const context = document.createElement('canvas').getContext('2d')!;

const widthOf = (text: string, font: string) => {
	context.font = font;
	return context.measureText(text).width;
};

function fitted(text: string, room: number) {
	if (widthOf(text, NAME_FONT) <= room) return text;
	let end = text.length;
	while (end > 1 && widthOf(`${text.slice(0, end)}…`, NAME_FONT) > room) end -= 1;
	return `${text.slice(0, end)}…`;
}

function wrapped(text: string, room: number, most: number) {
	const lines: string[] = [];
	let rest = text.split(' ');
	while (rest.length && lines.length < most - 1) {
		let taken = 1;
		while (taken < rest.length && widthOf(rest.slice(0, taken + 1).join(' '), NAME_FONT) <= room) taken += 1;
		if (widthOf(rest.slice(0, taken).join(' '), NAME_FONT) > room) break;
		lines.push(rest.slice(0, taken).join(' '));
		rest = rest.slice(taken);
	}
	if (rest.length) lines.push(fitted(rest.join(' '), room));
	return lines;
}

const baseline = (line: number) => FIRST_LINE + line * LINE;

/** Where a tile's name and size go in `box`, or none when the tile is too small for a name. */
export function layoutLabel(tile: Tile, box: Rect): Label | null {
	if (box.w <= 64 || box.h <= 40) return null;
	const room = box.w - PADDING * 2;
	const size = bytes(tile.size);
	const sizeWidth = widthOf(size, SIZE_FONT);
	const beside = tile.kind === 'dir' || tile.kind === 'part';
	const inline = { text: size, x: box.w - PADDING - sizeWidth, y: FIRST_LINE };
	if (beside && widthOf(tile.label, NAME_FONT) + INLINE_GAP + sizeWidth <= room) {
		return { lines: [tile.label], size: inline, height: baseline(0) + BELOW_LAST_LINE };
	}
	const fitsBelow = (lines: number) => box.h >= baseline(lines - 1) + SIZE_LINE + BOTTOM_ROOM;
	const lines = wrapped(tile.label, room, fitsBelow(MOST_LINES) ? MOST_LINES : 1);
	if (fitsBelow(lines.length)) {
		const y = baseline(lines.length - 1) + SIZE_LINE;
		return { lines, size: { text: size, x: PADDING, y }, height: y + BELOW_LAST_LINE };
	}
	const nameRoom = room - sizeWidth - INLINE_GAP;
	if (beside && nameRoom > SMALLEST_NAME) return { lines: [fitted(tile.label, nameRoom)], size: inline, height: baseline(0) + BELOW_LAST_LINE };
	return { lines, size: null, height: baseline(lines.length - 1) + BELOW_LAST_LINE };
}
