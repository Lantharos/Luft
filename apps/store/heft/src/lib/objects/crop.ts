import { WHOLE, type Crop, type PageObject } from '#lib/page/objects.js';

export type Edge = 'move' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const SMALLEST = 0.05;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function dragCrop(start: Crop, edge: Edge, dx: number, dy: number): Crop {
	if (edge === 'move') return { ...start, x: clamp(start.x + dx, 0, 1 - start.width), y: clamp(start.y + dy, 0, 1 - start.height) };
	let { x, y } = start;
	let right = start.x + start.width;
	let bottom = start.y + start.height;
	if (edge.endsWith('left')) x = clamp(x + dx, 0, right - SMALLEST);
	else right = clamp(right + dx, x + SMALLEST, 1);
	if (edge.startsWith('top')) y = clamp(y + dy, 0, bottom - SMALLEST);
	else bottom = clamp(bottom + dy, y + SMALLEST, 1);
	return { x, y, width: right - x, height: bottom - y };
}

export function cropped(object: PageObject, crop: Crop, natural: { width: number; height: number }): PageObject {
	const before = object.crop ?? WHOLE;
	const scale = object.width / (natural.width * before.width);
	return {
		...object,
		crop: { ...crop },
		x: object.x + (crop.x - before.x) * natural.width * scale,
		y: object.y + (crop.y - before.y) * natural.height * scale,
		width: crop.width * natural.width * scale,
		height: crop.height * natural.height * scale
	};
}
