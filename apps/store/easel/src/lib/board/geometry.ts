import type { Arrow, BoardObject, Box, Boxed, End, Frame } from './model';
import { FRAME_TITLE_GAP, FRAME_TITLE_SIZE, isBoxed } from './model';

type Point = [number, number];
type Lookup = (id: string) => BoardObject | undefined;

const LINE_HEIGHT = 1.3;
const measure = new OffscreenCanvas(1, 1).getContext('2d')!;

export function textBox(text: string, size: number): { w: number; h: number } {
	measure.font = `500 ${size}px "Open Runde"`;
	const lines = text.split('\n');
	return { w: Math.max(size, ...lines.map((line) => measure.measureText(line).width)), h: lines.length * size * LINE_HEIGHT };
}

export function union(boxes: Box[]): Box | null {
	if (!boxes.length) return null;
	const x = Math.min(...boxes.map((box) => box.x));
	const y = Math.min(...boxes.map((box) => box.y));
	return { x, y, w: Math.max(...boxes.map((box) => box.x + box.w)) - x, h: Math.max(...boxes.map((box) => box.y + box.h)) - y };
}

export function centerOf(box: Box): Point {
	return [box.x + box.w / 2, box.y + box.h / 2];
}

export function boundaryPoint(target: Boxed, toward: Point): Point {
	const [cx, cy] = centerOf(target);
	const dx = toward[0] - cx;
	const dy = toward[1] - cy;
	if (!dx && !dy) return [cx, cy];
	const hw = target.w / 2;
	const hh = target.h / 2;
	let t: number;
	if (target.kind === 'shape' && target.shape === 'ellipse') t = 1 / Math.sqrt((dx * dx) / (hw * hw) + (dy * dy) / (hh * hh));
	else if (target.kind === 'shape' && target.shape === 'diamond') t = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);
	else t = Math.min(hw / Math.abs(dx || 1e-9), hh / Math.abs(dy || 1e-9));
	return [cx + dx * t, cy + dy * t];
}

function attached(end: End, lookup: Lookup) {
	const object = end.attach ? lookup(end.attach) : undefined;
	return object && isBoxed(object) ? object : null;
}

function side(box: Boxed, horizontal: boolean, sign: number): Point {
	const [cx, cy] = centerOf(box);
	return horizontal ? [cx + (sign * box.w) / 2, cy] : [cx, cy + (sign * box.h) / 2];
}

function elbow(start: Point, end: Point, fromBox: Boxed | null, toBox: Boxed | null): Point[] {
	const horizontal = Math.abs(end[0] - start[0]) >= Math.abs(end[1] - start[1]);
	const sign = Math.sign(horizontal ? end[0] - start[0] : end[1] - start[1]) || 1;
	const a = fromBox ? side(fromBox, horizontal, sign) : start;
	const b = toBox ? side(toBox, horizontal, -sign) : end;
	if (horizontal) {
		const middle = (a[0] + b[0]) / 2;
		return a[1] === b[1] ? [a, b] : [a, [middle, a[1]], [middle, b[1]], b];
	}
	const middle = (a[1] + b[1]) / 2;
	return a[0] === b[0] ? [a, b] : [a, [a[0], middle], [b[0], middle], b];
}

export function arrowPath(arrow: Arrow, lookup: Lookup): Point[] {
	const fromBox = attached(arrow.from, lookup);
	const toBox = attached(arrow.to, lookup);
	const fromAim: Point = fromBox ? centerOf(fromBox) : [arrow.from.x, arrow.from.y];
	const toAim: Point = toBox ? centerOf(toBox) : [arrow.to.x, arrow.to.y];
	if (arrow.route === 'elbow') return elbow(fromAim, toAim, fromBox, toBox);
	return [fromBox ? boundaryPoint(fromBox, toAim) : fromAim, toBox ? boundaryPoint(toBox, fromAim) : toAim];
}

export const FRAME_BAND = FRAME_TITLE_SIZE * LINE_HEIGHT + FRAME_TITLE_GAP;

function pointsBox(points: Point[], pad: number): Box {
	const xs = points.map((point) => point[0]);
	const ys = points.map((point) => point[1]);
	const x = Math.min(...xs) - pad;
	const y = Math.min(...ys) - pad;
	return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
}

function hitsFrame(frame: Frame, x: number, y: number, slop: number) {
	const across = x >= frame.x - slop && x <= frame.x + frame.w + slop;
	if (across && y >= frame.y - FRAME_BAND && y <= frame.y) return true;
	const near = across && y >= frame.y - slop && y <= frame.y + frame.h + slop;
	const deep = x > frame.x + slop && x < frame.x + frame.w - slop && y > frame.y + slop && y < frame.y + frame.h - slop;
	return near && !deep;
}

export function bounds(object: BoardObject, lookup: Lookup): Box {
	switch (object.kind) {
		case 'stroke': {
			let left = Infinity;
			let top = Infinity;
			let right = -Infinity;
			let bottom = -Infinity;
			for (let at = 0; at < object.points.length; at += 3) {
				left = Math.min(left, object.points[at]);
				right = Math.max(right, object.points[at]);
				top = Math.min(top, object.points[at + 1]);
				bottom = Math.max(bottom, object.points[at + 1]);
			}
			const pad = object.width;
			return { x: left - pad, y: top - pad, w: right - left + pad * 2, h: bottom - top + pad * 2 };
		}
		case 'arrow':
			return pointsBox(arrowPath(object, lookup), object.width * 4);
		case 'frame':
			return { x: object.x, y: object.y - FRAME_BAND, w: object.w, h: object.h + FRAME_BAND };
		case 'text': {
			const size = textBox(object.text || ' ', object.size);
			return { x: object.x, y: object.y, ...size };
		}
		default:
			return { x: object.x, y: object.y, w: object.w, h: object.h };
	}
}

export function intersects(a: Box, b: Box) {
	return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function contains(outer: Box, inner: Box) {
	return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.w <= outer.x + outer.w && inner.y + inner.h <= outer.y + outer.h;
}

export function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
	const dx = bx - ax;
	const dy = by - ay;
	const length = dx * dx + dy * dy;
	const t = length ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length)) : 0;
	return Math.hypot(px - ax - dx * t, py - ay - dy * t);
}

export function hits(object: BoardObject, x: number, y: number, slop: number, lookup: Lookup) {
	if (object.kind === 'stroke') {
		const reach = object.width / 2 + slop;
		for (let at = 3; at < object.points.length; at += 3) {
			if (segmentDistance(x, y, object.points[at - 3], object.points[at - 2], object.points[at], object.points[at + 1]) <= reach) return true;
		}
		return object.points.length === 3 && Math.hypot(x - object.points[0], y - object.points[1]) <= reach;
	}
	if (object.kind === 'arrow') {
		const path = arrowPath(object, lookup);
		return path.slice(1).some((point, index) => segmentDistance(x, y, ...path[index], ...point) <= object.width / 2 + slop);
	}
	if (object.kind === 'frame') return hitsFrame(object, x, y, slop);
	const box = bounds(object, lookup);
	return x >= box.x - slop && y >= box.y - slop && x <= box.x + box.w + slop && y <= box.y + box.h + slop;
}

export { LINE_HEIGHT };
