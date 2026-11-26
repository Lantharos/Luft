import type { Arrow, BoardObject, Box, Boxed, End } from './model';
import { isBoxed } from './model';

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

export function centerOf(box: Box): [number, number] {
	return [box.x + box.w / 2, box.y + box.h / 2];
}

export function boundaryPoint(target: Boxed, toward: [number, number]): [number, number] {
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

export function arrowEnds(arrow: Arrow, lookup: (id: string) => BoardObject | undefined): [[number, number], [number, number]] {
	const target = (end: End) => {
		const object = end.attach ? lookup(end.attach) : undefined;
		return object && isBoxed(object) ? object : null;
	};
	const fromBox = target(arrow.from);
	const toBox = target(arrow.to);
	const fromAim: [number, number] = fromBox ? centerOf(fromBox) : [arrow.from.x, arrow.from.y];
	const toAim: [number, number] = toBox ? centerOf(toBox) : [arrow.to.x, arrow.to.y];
	return [fromBox ? boundaryPoint(fromBox, toAim) : fromAim, toBox ? boundaryPoint(toBox, fromAim) : toAim];
}

export function bounds(object: BoardObject, lookup: (id: string) => BoardObject | undefined): Box {
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
		case 'arrow': {
			const [[x1, y1], [x2, y2]] = arrowEnds(object, lookup);
			const pad = object.width * 4;
			return { x: Math.min(x1, x2) - pad, y: Math.min(y1, y2) - pad, w: Math.abs(x2 - x1) + pad * 2, h: Math.abs(y2 - y1) + pad * 2 };
		}
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

export function hits(object: BoardObject, x: number, y: number, slop: number, lookup: (id: string) => BoardObject | undefined) {
	if (object.kind === 'stroke') {
		const reach = object.width / 2 + slop;
		for (let at = 3; at < object.points.length; at += 3) {
			if (segmentDistance(x, y, object.points[at - 3], object.points[at - 2], object.points[at], object.points[at + 1]) <= reach) return true;
		}
		return object.points.length === 3 && Math.hypot(x - object.points[0], y - object.points[1]) <= reach;
	}
	if (object.kind === 'arrow') {
		const [[x1, y1], [x2, y2]] = arrowEnds(object, lookup);
		return segmentDistance(x, y, x1, y1, x2, y2) <= object.width / 2 + slop;
	}
	const box = bounds(object, lookup);
	return x >= box.x - slop && y >= box.y - slop && x <= box.x + box.w + slop && y <= box.y + box.h + slop;
}

export { LINE_HEIGHT };
