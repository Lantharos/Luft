import { segmentDistance } from './geometry';
import type { ShapeKind } from './model';

type Point = [number, number];

export type Recognized = { kind: 'shape'; shape: ShapeKind; x: number; y: number; w: number; h: number } | { kind: 'line'; from: Point; to: Point; head: boolean };

const MIN_SIZE = 12;
const CORNER_TOLERANCE = 0.08;
const CLOSED_SHARE = 0.22;
const RIGHT_ANGLE_SLACK = 0.5;
const LEVEL_SLACK = 0.3;

function simplify(points: Point[], tolerance: number): Point[] {
	if (points.length < 3) return points;
	const first = points[0];
	const last = points.at(-1)!;
	let furthest = 0;
	let index = 0;
	for (let at = 1; at < points.length - 1; at++) {
		const away = segmentDistance(points[at][0], points[at][1], first[0], first[1], last[0], last[1]);
		if (away > furthest) {
			furthest = away;
			index = at;
		}
	}
	if (furthest <= tolerance) return [first, last];
	return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

const distance = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);

function angleAt(a: Point, b: Point, c: Point) {
	const turn = Math.abs(Math.atan2(a[1] - b[1], a[0] - b[0]) - Math.atan2(c[1] - b[1], c[0] - b[0])) % (Math.PI * 2);
	return turn > Math.PI ? Math.PI * 2 - turn : turn;
}

function box(points: Point[]) {
	const xs = points.map(([x]) => x);
	const ys = points.map(([, y]) => y);
	const x = Math.min(...xs);
	const y = Math.min(...ys);
	return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export function recognize(flat: number[]): Recognized | null {
	const points: Point[] = [];
	for (let at = 0; at < flat.length; at += 3) points.push([flat[at], flat[at + 1]]);
	if (points.length < 4) return null;
	const bounds = box(points);
	const diagonal = Math.hypot(bounds.w, bounds.h);
	if (diagonal < MIN_SIZE) return null;
	const start = points[0];
	const end = points.at(-1)!;
	const corners = simplify(points, diagonal * CORNER_TOLERANCE);
	if (distance(start, end) > diagonal * CLOSED_SHARE) {
		if (corners.length === 2) return { kind: 'line', from: start, to: end, head: false };
		if (corners.length === 4 || corners.length === 5) {
			const [tail, tip, side] = corners;
			const shaft = distance(tail, tip);
			const head = Math.max(...corners.slice(2).map((corner) => distance(tip, corner)));
			if (shaft > distance(side, tip) * 2 && head < shaft * 0.45) return { kind: 'line', from: tail, to: tip, head: true };
		}
		return null;
	}
	const ring = corners.slice(0, -1);
	const square = ring.length === 4 && ring.every((corner, index) => Math.abs(angleAt(ring[(index + 3) % 4], corner, ring[(index + 1) % 4]) - Math.PI / 2) < RIGHT_ANGLE_SLACK);
	if (square) {
		const level = ring.every((corner, index) => {
			const next = ring[(index + 1) % 4];
			const angle = Math.abs(Math.atan2(next[1] - corner[1], next[0] - corner[0])) % (Math.PI / 2);
			return Math.min(angle, Math.PI / 2 - angle) < LEVEL_SLACK;
		});
		return { kind: 'shape', shape: level ? 'rectangle' : 'diamond', ...bounds };
	}
	if (ring.length >= 4) return { kind: 'shape', shape: 'ellipse', ...bounds };
	return null;
}
