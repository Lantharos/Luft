export interface Placed {
	left: number;
	width: number;
}

export interface Fitted {
	placed: Placed[];
	pixelsPerByte: number;
}

export function fit(sizes: number[], width: number, gap: number, smallest: number): Fitted {
	const room = Math.max(0, width - gap * Math.max(0, sizes.length - 1));
	const pinned = new Set<number>();
	let pixelsPerByte = 0;
	for (;;) {
		const flexible = sizes.reduce((total, size, index) => (pinned.has(index) ? total : total + size), 0);
		pixelsPerByte = flexible > 0 ? Math.max(0, room - pinned.size * smallest) / flexible : 0;
		const count = pinned.size;
		sizes.forEach((size, index) => size * pixelsPerByte < smallest && pinned.add(index));
		if (pinned.size === count) break;
	}
	let left = 0;
	const placed = sizes.map((size, index) => {
		const span = pinned.has(index) ? smallest : size * pixelsPerByte;
		const box = { left, width: span };
		left += span + gap;
		return box;
	});
	return { placed, pixelsPerByte };
}
