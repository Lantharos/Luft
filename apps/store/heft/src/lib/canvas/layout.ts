export interface PageRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface Layout {
	width: number;
	height: number;
	pages: PageRect[];
}

const GAP = 22;
const MARGIN = 28;

export function stack(sizes: { width: number; height: number }[], margin = MARGIN): Layout {
	const width = Math.max(0, ...sizes.map((size) => size.width)) + margin * 2;
	let top = margin;
	const pages = sizes.map((size) => {
		const rect = { left: (width - size.width) / 2, top, width: size.width, height: size.height };
		top += size.height + GAP;
		return rect;
	});
	return { width, height: top - GAP + margin, pages };
}

export function pageNear(layout: Layout, y: number): number {
	let low = 0;
	let high = layout.pages.length - 1;
	while (low < high) {
		const middle = (low + high + 1) >> 1;
		if (layout.pages[middle].top - GAP / 2 <= y) low = middle;
		else high = middle - 1;
	}
	return low;
}

export function pagesIn(layout: Layout, top: number, bottom: number): [number, number] {
	if (!layout.pages.length) return [0, -1];
	let first = pageNear(layout, top);
	const last = pageNear(layout, bottom);
	if (layout.pages[first].top + layout.pages[first].height < top && first < last) first++;
	return [first, last];
}
