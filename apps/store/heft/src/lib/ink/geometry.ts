import { POINT_FIELDS, type Stroke } from './stroke';

const TAU = Math.PI * 2;

/** Anything a stroke's outline can be traced into: a Path2D, or a PDF page. */
export type PathSink = Pick<Path2D, 'moveTo' | 'lineTo' | 'arc' | 'closePath'>;

export function addDot(path: PathSink, x: number, y: number, radius: number) {
	path.moveTo(x + radius, y);
	path.arc(x, y, radius, 0, TAU);
}

/**
 * The quad between two round ends, wound the same way as `addDot`'s circles,
 * so a nonzero fill of all of them is their union.
 */
export function addSegment(path: PathSink, x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const distance = Math.hypot(dx, dy);
	if (distance <= Math.abs(r1 - r2) + 1e-6) return;
	const ux = dx / distance;
	const uy = dy / distance;
	const sine = (r1 - r2) / distance;
	const cosine = Math.sqrt(1 - sine * sine);
	const lx = ux * sine - uy * cosine;
	const ly = uy * sine + ux * cosine;
	const rx = ux * sine + uy * cosine;
	const ry = uy * sine - ux * cosine;
	path.moveTo(x1 + lx * r1, y1 + ly * r1);
	path.lineTo(x1 + rx * r1, y1 + ry * r1);
	path.lineTo(x2 + rx * r2, y2 + ry * r2);
	path.lineTo(x2 + lx * r2, y2 + ly * r2);
	path.closePath();
}

export function strokePath(points: Float32Array, from = 0): Path2D {
	return traceStroke(new Path2D(), points, from);
}

export function traceStroke<Sink extends PathSink>(path: Sink, points: Float32Array, from = 0): Sink {
	const start = from * POINT_FIELDS;
	if (start >= points.length) return path;
	let x = points[start];
	let y = points[start + 1];
	let r = points[start + 2] / 2;
	if (start === 0) addDot(path, x, y, r);
	for (let index = start + POINT_FIELDS; index < points.length; index += POINT_FIELDS) {
		const nx = points[index];
		const ny = points[index + 1];
		const nr = points[index + 2] / 2;
		addSegment(path, x, y, r, nx, ny, nr);
		addDot(path, nx, ny, nr);
		x = nx;
		y = ny;
		r = nr;
	}
	return path;
}

export function pathOf(stroke: Stroke): Path2D {
	stroke.path ??= strokePath(stroke.points);
	return stroke.path;
}

export function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const length = dx * dx + dy * dy;
	const along = length === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / length));
	return Math.hypot(px - (x1 + along * dx), py - (y1 + along * dy));
}
