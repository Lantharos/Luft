import { distanceToSegment } from './geometry';
import { POINT_FIELDS } from './stroke';

type Point = [number, number];

const ELLIPSE_STEPS = 72;

function simplify(points: Point[], tolerance: number): Point[] {
	if (points.length < 3) return points;
	const [first, last] = [points[0], points.at(-1)!];
	let furthest = 0;
	let index = 0;
	for (let at = 1; at < points.length - 1; at++) {
		const away = distanceToSegment(points[at][0], points[at][1], first[0], first[1], last[0], last[1]);
		if (away > furthest) {
			furthest = away;
			index = at;
		}
	}
	if (furthest <= tolerance) return [first, last];
	return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

const length = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);

function angleAt(a: Point, b: Point, c: Point) {
	const first = Math.atan2(a[1] - b[1], a[0] - b[0]);
	const second = Math.atan2(c[1] - b[1], c[0] - b[0]);
	const angle = Math.abs(first - second) % (2 * Math.PI);
	return angle > Math.PI ? 2 * Math.PI - angle : angle;
}

function ellipse(points: Point[]): Point[] {
	const xs = points.map(([x]) => x);
	const ys = points.map(([, y]) => y);
	const [left, right, top, bottom] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
	let [rx, ry] = [(right - left) / 2, (bottom - top) / 2];
	if (Math.abs(rx - ry) / Math.max(rx, ry) < 0.12) rx = ry = (rx + ry) / 2;
	const [cx, cy] = [(left + right) / 2, (top + bottom) / 2];
	return Array.from({ length: ELLIPSE_STEPS + 1 }, (_, step) => {
		const angle = (step / ELLIPSE_STEPS) * Math.PI * 2;
		return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
	});
}

function quad(corners: Point[]): Point[] {
	const xs = corners.map(([x]) => x);
	const ys = corners.map(([, y]) => y);
	const level = corners.every((corner, index) => {
		const next = corners[(index + 1) % 4];
		const angle = Math.abs(Math.atan2(next[1] - corner[1], next[0] - corner[0])) % (Math.PI / 2);
		return Math.min(angle, Math.PI / 2 - angle) < 0.2;
	});
	if (!level) return [...corners, corners[0]];
	const [left, right, top, bottom] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
	return [[left, top], [right, top], [right, bottom], [left, bottom], [left, top]];
}

export function recognize(raw: Point[]): Point[][] | null {
	if (raw.length < 4) return null;
	const xs = raw.map(([x]) => x);
	const ys = raw.map(([, y]) => y);
	const diagonal = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
	if (diagonal < 12) return null;
	const [start, end] = [raw[0], raw.at(-1)!];
	const corners = simplify(raw, diagonal * 0.07);
	const closed = length(start, end) < diagonal * 0.2;
	if (!closed) {
		if (corners.length === 2) return [[start, end]];
		if (corners.length === 4 || corners.length === 5) {
			const [tail, tip, side, back] = corners;
			const shaft = length(tail, tip);
			const head = Math.max(...corners.slice(2).map((corner) => length(tip, corner)));
			const returns = corners.length === 5 ? length(back, tip) < head * 0.5 : length(back, tip) < head * 0.6 + diagonal * 0.05;
			if (shaft > length(side, tip) * 2 && head < shaft * 0.45 && returns) {
				const along = Math.atan2(tip[1] - tail[1], tip[0] - tail[0]);
				const size = Math.max(head, shaft * 0.12);
				const wing = (turn: number): Point => [tip[0] - Math.cos(along + turn) * size, tip[1] - Math.sin(along + turn) * size];
				return [[tail, tip], [wing(0.45), tip, wing(-0.45)]];
			}
		}
		return null;
	}
	const ring = corners.slice(0, -1);
	if (ring.length === 3) return [[...ring, ring[0]]];
	if (ring.length === 4 && ring.every((corner, index) => Math.abs(angleAt(ring[(index + 3) % 4], corner, ring[(index + 1) % 4]) - Math.PI / 2) < 0.5)) {
		return [quad(ring)];
	}
	if (ring.length >= 5 || ring.length === 4) return [ellipse(raw)];
	return null;
}

export function outlinePoints(outline: Point[], width: number): Float32Array {
	const points = new Float32Array(outline.length * POINT_FIELDS);
	outline.forEach(([x, y], index) => points.set([x, y, width, 0.5, 0], index * POINT_FIELDS));
	return points;
}
