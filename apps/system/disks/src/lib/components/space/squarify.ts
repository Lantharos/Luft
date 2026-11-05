export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

function worst(sum: number, smallest: number, largest: number, side: number) {
	const squared = side * side;
	return Math.max((squared * largest) / (sum * sum), (sum * sum) / (squared * smallest));
}

export function squarify(sizes: number[], bounds: Rect): (Rect | null)[] {
	const out: (Rect | null)[] = sizes.map(() => null);
	const order = sizes.map((size, index) => ({ size, index })).filter((entry) => entry.size > 0);
	const total = order.reduce((sum, entry) => sum + entry.size, 0);
	if (!total || bounds.w <= 0 || bounds.h <= 0) return out;
	const scale = (bounds.w * bounds.h) / total;
	let { x, y, w, h } = bounds;
	let start = 0;
	while (start < order.length) {
		const side = Math.min(w, h);
		let sum = order[start].size * scale;
		let smallest = sum;
		let largest = sum;
		let ratio = worst(sum, smallest, largest, side);
		let end = start + 1;
		while (end < order.length) {
			const area = order[end].size * scale;
			const next = worst(sum + area, Math.min(smallest, area), Math.max(largest, area), side);
			if (next > ratio) break;
			sum += area;
			smallest = Math.min(smallest, area);
			largest = Math.max(largest, area);
			ratio = next;
			end += 1;
		}
		const thickness = sum / side;
		let offset = 0;
		for (let index = start; index < end; index++) {
			const length = (order[index].size * scale) / thickness;
			out[order[index].index] = w >= h ? { x, y: y + offset, w: thickness, h: length } : { x: x + offset, y, w: length, h: thickness };
			offset += length;
		}
		if (w >= h) {
			x += thickness;
			w -= thickness;
		} else {
			y += thickness;
			h -= thickness;
		}
		start = end;
	}
	return out;
}
