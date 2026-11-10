import { alongOf, edgeOf, isVerticalEdge, SPOTS, type Along, type Edge, type Spot } from './model';

export interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface Span {
	start: number;
	end: number;
}

export interface Placed {
	along: Along;
	length: number;
}

export function placeAlong(span: Span, items: Placed[], gap: number, middle = (span.start + span.end) / 2): number[] {
	const ends = { start: span.start, end: span.end };
	for (const { along, length } of items) {
		if (along === 'start') ends.start = Math.max(ends.start, span.start + length + gap);
		if (along === 'end') ends.end = Math.min(ends.end, span.end - length - gap);
	}
	return items.map(({ along, length }) => {
		if (along === 'start') return span.start;
		if (along === 'end') return span.end - length;
		const centred = middle - length / 2;
		return Math.max(ends.start, Math.min(centred, ends.end - length));
	});
}

export interface IslandFrame {
	width: number;
	height: number;
	thickness: number;
	margin: number;
	rightToLeft: boolean;
}

export interface IslandBox extends Box {
	spot: Spot;
	edge: Edge;
}

type Corner = { horizontal: 'top' | 'bottom'; vertical: 'left' | 'right' };
const CORNERS: Corner[] = (['top', 'bottom'] as const).flatMap((horizontal) => (['left', 'right'] as const).map((vertical) => ({ horizontal, vertical })));

function bandOf(edge: Edge, { width, height, thickness, margin }: IslandFrame): Box {
	switch (edge) {
		case 'bottom':
			return { x: 0, y: height - margin - thickness, width, height: thickness };
		case 'top':
			return { x: 0, y: margin, width, height: thickness };
		case 'left':
			return { x: margin, y: 0, width: thickness, height };
		case 'right':
			return { x: width - margin - thickness, y: 0, width: thickness, height };
	}
}

const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

function layEdge(edge: Edge, islands: { spot: Spot; length: number }[], span: Span, frame: IslandFrame): IslandBox[] {
	const band = bandOf(edge, frame);
	const starts = placeAlong(span, islands.map(({ spot, length }) => ({ along: alongOf(spot), length })), frame.margin);
	return islands.map(({ spot, length }, index) => {
		if (isVerticalEdge(edge)) return { spot, edge, x: band.x, y: starts[index], width: band.width, height: length };
		const x = frame.rightToLeft ? frame.width - starts[index] - length : starts[index];
		return { spot, edge, x, y: band.y, width: length, height: band.height };
	});
}

export function layIslands(islands: { spot: Spot; length: number }[], frame: IslandFrame): IslandBox[] {
	const on = (edge: Edge) => islands.filter(({ spot }) => edgeOf(spot) === edge);
	const full = (edge: Edge): Span => {
		const length = isVerticalEdge(edge) ? frame.height : frame.width;
		return { start: frame.margin, end: length - frame.margin };
	};
	const boxes = (['top', 'bottom'] as const).flatMap((edge) => layEdge(edge, on(edge), full(edge), frame));
	for (const edge of ['left', 'right'] as const) {
		const span = full(edge);
		const first = layEdge(edge, on(edge), span, frame);
		for (const { horizontal, vertical } of CORNERS) {
			if (vertical !== edge) continue;
			const row = bandOf(horizontal, frame);
			const column = bandOf(vertical, frame);
			const crowded = boxes.some((box) => box.edge === horizontal && overlaps(box, column)) && first.some((box) => overlaps(box, row));
			if (!crowded) continue;
			if (horizontal === 'top') span.start = row.y + row.height + frame.margin;
			else span.end = row.y - frame.margin;
		}
		boxes.push(...layEdge(edge, on(edge), span, frame));
	}
	return boxes;
}

export function spotTargets(frame: IslandFrame, length: number): IslandBox[] {
	return layIslands(
		SPOTS.map((spot) => ({ spot, length })),
		frame
	);
}

const middleOf = ({ x, y, width, height }: Box): [number, number] => [x + width / 2, y + height / 2];

export function spotNear(targets: IslandBox[], x: number, y: number, reach: number): Spot | null {
	let nearest: Spot | null = null;
	let distance = reach;
	for (const target of targets) {
		const [targetX, targetY] = middleOf(target);
		const away = Math.hypot(targetX - x, targetY - y);
		if (away < distance) {
			distance = away;
			nearest = target.spot;
		}
	}
	return nearest;
}

export function spotToward(targets: IslandBox[], spot: Spot, [dx, dy]: [number, number]): Spot | null {
	const [fromX, fromY] = middleOf(targets.find((target) => target.spot === spot)!);
	let best: Spot | null = null;
	let bestScore = Infinity;
	for (const target of targets) {
		const [x, y] = middleOf(target);
		const along = (x - fromX) * dx + (y - fromY) * dy;
		if (target.spot === spot || along <= 0) continue;
		const score = along + 2 * Math.abs((x - fromX) * dy - (y - fromY) * dx);
		if (score < bestScore) {
			bestScore = score;
			best = target.spot;
		}
	}
	return best;
}
