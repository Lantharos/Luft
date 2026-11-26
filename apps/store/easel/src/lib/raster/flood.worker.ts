const TILE = 512;
const SHIFT = 9;

export interface FloodRequest {
	tiles: Map<number, Uint8Array>;
	cols: number;
	width: number;
	height: number;
	x: number;
	y: number;
	tolerance: number;
	contiguous: boolean;
}

export interface FloodResult {
	mask: Uint8Array;
	bounds: { x: number; y: number; width: number; height: number };
}

function flood({ tiles, cols, width, height, x, y, tolerance, contiguous }: FloodRequest): FloodResult {
	const empty = new Uint8Array(4);
	const pixel = (px: number, py: number) => {
		const tile = tiles.get((py >> SHIFT) * cols + (px >> SHIFT));
		const at = (((py & (TILE - 1)) << SHIFT) + (px & (TILE - 1))) * 4;
		return tile ? tile.subarray(at, at + 4) : empty;
	};
	const seed = Array.from(pixel(x, y));
	const limit = tolerance * 255;
	const matches = (px: number, py: number) => {
		const color = pixel(px, py);
		return Math.abs(color[0] - seed[0]) <= limit && Math.abs(color[1] - seed[1]) <= limit && Math.abs(color[2] - seed[2]) <= limit && Math.abs(color[3] - seed[3]) <= limit;
	};
	const filled = new Uint8Array(width * height);
	let left = x;
	let right = x;
	let top = y;
	let bottom = y;
	const mark = (px: number, py: number) => {
		filled[py * width + px] = 255;
		if (px < left) left = px;
		if (px > right) right = px;
		if (py < top) top = py;
		if (py > bottom) bottom = py;
	};
	if (!contiguous) {
		for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) if (matches(px, py)) mark(px, py);
	} else {
		const stack = [x, y];
		while (stack.length) {
			const py = stack.pop()!;
			let px = stack.pop()!;
			while (px > 0 && !filled[py * width + px - 1] && matches(px - 1, py)) px--;
			let above = false;
			let below = false;
			for (; px < width && !filled[py * width + px] && matches(px, py); px++) {
				mark(px, py);
				if (py > 0) {
					const open = !filled[(py - 1) * width + px] && matches(px, py - 1);
					if (open && !above) stack.push(px, py - 1);
					above = open;
				}
				if (py < height - 1) {
					const open = !filled[(py + 1) * width + px] && matches(px, py + 1);
					if (open && !below) stack.push(px, py + 1);
					below = open;
				}
			}
		}
	}
	const bounds = { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
	const mask = new Uint8Array(bounds.width * bounds.height);
	for (let py = 0; py < bounds.height; py++) mask.set(filled.subarray((py + top) * width + left, (py + top) * width + left + bounds.width), py * bounds.width);
	return { mask, bounds };
}

self.onmessage = (event: MessageEvent<FloodRequest>) => {
	const result = flood(event.data);
	(self as unknown as Worker).postMessage(result, [result.mask.buffer]);
};
