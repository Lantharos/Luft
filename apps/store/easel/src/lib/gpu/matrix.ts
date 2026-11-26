export type Matrix = [number, number, number, number, number, number];

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

export function multiply([a, b, c, d, e, f]: Matrix, [g, h, i, j, k, l]: Matrix): Matrix {
	return [a * g + c * h, b * g + d * h, a * i + c * j, b * i + d * j, a * k + c * l + e, b * k + d * l + f];
}

export function invert([a, b, c, d, e, f]: Matrix): Matrix {
	const det = a * d - b * c;
	return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}

export function apply([a, b, c, d, e, f]: Matrix, x: number, y: number): [number, number] {
	return [a * x + c * y + e, b * x + d * y + f];
}

export const translation = (x: number, y: number): Matrix => [1, 0, 0, 1, x, y];
export const scaling = (x: number, y = x): Matrix => [x, 0, 0, y, 0, 0];
export const rotation = (angle: number): Matrix => [Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0];

export function packed([a, b, c, d, e, f]: Matrix, into: Float32Array, at = 0) {
	into.set([a, b, 0, 0, c, d, 0, 0, e, f, 1, 0], at);
}
