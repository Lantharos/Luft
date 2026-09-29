export interface Placement {
	stageWidth: number;
	stageHeight: number;
	imageWidth: number;
	imageHeight: number;
	scale: number;
	rotation: number;
	flipped: boolean;
	offsetX: number;
	offsetY: number;
	pixelRatio: number;
}

const QUARTER_TURNS = [
	[1, 0],
	[0, 1],
	[-1, 0],
	[0, -1]
];

export function cssMatrix(placement: Placement) {
	const { imageWidth, imageHeight, scale, rotation, flipped, stageWidth, stageHeight, offsetX, offsetY, pixelRatio } = placement;
	const [cos, sin] = QUARTER_TURNS[rotation];
	const flip = flipped ? -1 : 1;
	const a = cos * scale * flip;
	const b = sin * scale * flip;
	const c = -sin * scale;
	const d = cos * scale;
	const centerX = stageWidth / 2 + offsetX;
	const centerY = stageHeight / 2 + offsetY;
	const originX = centerX - (a * imageWidth + c * imageHeight) / 2;
	const originY = centerY - (b * imageWidth + d * imageHeight) / 2;
	const snap = (value: number) => Math.round(value * pixelRatio) / pixelRatio;
	return { a, b, c, d, e: snap(originX), f: snap(originY) };
}

export function clipMatrix(placement: Placement) {
	const { a, b, c, d, e, f } = cssMatrix(placement);
	const x = 2 / placement.stageWidth;
	const y = -2 / placement.stageHeight;
	return new Float32Array([a * x, b * y, 0, c * x, d * y, 0, e * x - 1, f * y + 1, 1]);
}
