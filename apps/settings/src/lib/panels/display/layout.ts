export interface Rect {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

const ALIGN_PULL = 0.12;

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

function touches(a: Rect, b: Rect) {
	const sideBySide = (a.x + a.width === b.x || b.x + b.width === a.x) && a.y < b.y + b.height && b.y < a.y + a.height;
	const stacked = (a.y + a.height === b.y || b.y + b.height === a.y) && a.x < b.x + b.width && b.x < a.x + a.width;
	return sideBySide || stacked;
}

export function isValidLayout(rects: Rect[]) {
	if (rects.some((rect, index) => rects.slice(index + 1).some((other) => overlaps(rect, other)))) return false;
	const reached = new Set([rects[0]?.id]);
	const queue = rects.slice(0, 1);
	while (queue.length) {
		const current = queue.pop()!;
		for (const other of rects) {
			if (!reached.has(other.id) && touches(current, other)) {
				reached.add(other.id);
				queue.push(other);
			}
		}
	}
	return reached.size === rects.length;
}

export function normalized<T extends Rect>(rects: T[]): T[] {
	const left = Math.min(...rects.map((rect) => rect.x));
	const top = Math.min(...rects.map((rect) => rect.y));
	return rects.map((rect) => ({ ...rect, x: rect.x - left, y: rect.y - top }));
}

export function inRow<T extends Rect>(rects: T[]): T[] {
	let x = 0;
	return rects.map((rect) => {
		const placed = { ...rect, x, y: 0 };
		x += rect.width;
		return placed;
	});
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

function spans(desired: number, start: number, length: number, size: number) {
	return [clamp(desired, start - size + 1, start + length - 1), start, start + length - size];
}

function candidates(moving: Rect, anchor: Rect, x: number, y: number) {
	const across = spans(y, anchor.y, anchor.height, moving.height);
	const along = spans(x, anchor.x, anchor.width, moving.width);
	return [
		...across.map((top, index) => ({ x: anchor.x + anchor.width, y: top, aligned: index > 0 })),
		...across.map((top, index) => ({ x: anchor.x - moving.width, y: top, aligned: index > 0 })),
		...along.map((left, index) => ({ x: left, y: anchor.y + anchor.height, aligned: index > 0 })),
		...along.map((left, index) => ({ x: left, y: anchor.y - moving.height, aligned: index > 0 }))
	];
}

export function snap(rects: Rect[], id: string, x: number, y: number) {
	const moving = rects.find((rect) => rect.id === id)!;
	const others = rects.filter((rect) => rect.id !== id);
	const pull = ALIGN_PULL * Math.min(moving.width, moving.height);
	const ranked = others
		.flatMap((anchor) => candidates(moving, anchor, x, y))
		.map((spot) => ({ ...spot, score: Math.hypot(spot.x - x, spot.y - y) - (spot.aligned ? pull : 0) }))
		.sort((a, b) => a.score - b.score);
	for (const spot of ranked) {
		const placed = { ...moving, x: Math.round(spot.x), y: Math.round(spot.y) };
		if (isValidLayout([...others, placed])) return placed;
	}
	return null;
}
