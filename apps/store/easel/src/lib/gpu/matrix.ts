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

export type Projective = [number, number, number, number, number, number, number, number, number];

export const projective = ([a, b, c, d, e, f]: Matrix): Projective => [a, b, 0, c, d, 0, e, f, 1];

export function packedProjective(matrix: Projective, into: Float32Array, at = 0) {
	const [a, b, c, d, e, f, g, h, i] = matrix;
	into.set([a, b, c, 0, d, e, f, 0, g, h, i, 0], at);
}

export function applyProjective(m: Projective, x: number, y: number): [number, number] {
	const w = m[2] * x + m[5] * y + m[8];
	return [(m[0] * x + m[3] * y + m[6]) / w, (m[1] * x + m[4] * y + m[7]) / w];
}

export function invertProjective(m: Projective): Projective {
	const [a, b, c, d, e, f, g, h, i] = m;
	const A = e * i - f * h;
	const B = -(b * i - c * h);
	const C = b * f - c * e;
	const det = a * A + d * B + g * C;
	return [A / det, B / det, C / det, -(d * i - f * g) / det, (a * i - c * g) / det, -(a * f - c * d) / det, (d * h - e * g) / det, -(a * h - b * g) / det, (a * e - b * d) / det];
}

export function quadMapping(x: number, y: number, width: number, height: number, corners: [number, number][]): Projective {
	const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = corners;
	const dx1 = x1 - x2;
	const dx2 = x3 - x2;
	const dy1 = y1 - y2;
	const dy2 = y3 - y2;
	const sx = x0 - x1 + x2 - x3;
	const sy = y0 - y1 + y2 - y3;
	const det = dx1 * dy2 - dx2 * dy1;
	const g = (sx * dy2 - dx2 * sy) / det;
	const h = (dx1 * sy - sx * dy1) / det;
	const unit: Projective = [x1 - x0 + g * x1, y1 - y0 + g * y1, g, x3 - x0 + h * x3, y3 - y0 + h * y3, h, x0, y0, 1];
	const toUnit: Projective = [1 / width, 0, 0, 0, 1 / height, 0, -x / width, -y / height, 1];
	return multiplyProjective(unit, toUnit);
}

export function multiplyProjective(m: Projective, n: Projective): Projective {
	const out = new Array(9).fill(0) as Projective;
	for (let column = 0; column < 3; column++) for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) out[column * 3 + row] += m[k * 3 + row] * n[column * 3 + k];
	return out;
}
