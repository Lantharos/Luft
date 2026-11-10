export type Tool = 'pen' | 'highlighter';
export type Nib = 'fountain' | 'ballpoint';

export const POINT_FIELDS = 5;

export interface Stroke {
	id: string;
	order: number;
	tool: Tool;
	nib: Nib;
	color: number;
	width: number;
	started: number;
	points: Float32Array;
	bounds: Bounds;
	path?: Path2D;
}

export interface Bounds {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export const emptyBounds = (): Bounds => ({ left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

export function grow(bounds: Bounds, x: number, y: number, radius: number) {
	if (x - radius < bounds.left) bounds.left = x - radius;
	if (y - radius < bounds.top) bounds.top = y - radius;
	if (x + radius > bounds.right) bounds.right = x + radius;
	if (y + radius > bounds.bottom) bounds.bottom = y + radius;
}

export function union(into: Bounds, other: Bounds) {
	into.left = Math.min(into.left, other.left);
	into.top = Math.min(into.top, other.top);
	into.right = Math.max(into.right, other.right);
	into.bottom = Math.max(into.bottom, other.bottom);
}

export const overlaps = (a: Bounds, b: Bounds) => a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;

export function strokeBounds(points: Float32Array): Bounds {
	const bounds = emptyBounds();
	for (let index = 0; index < points.length; index += POINT_FIELDS) {
		grow(bounds, points[index], points[index + 1], points[index + 2] / 2);
	}
	return bounds;
}

export function newId(): string {
	const high = crypto.getRandomValues(new Uint32Array(2));
	return (high[0] * 2 ** 20 + (high[1] >>> 12)).toString(36);
}
