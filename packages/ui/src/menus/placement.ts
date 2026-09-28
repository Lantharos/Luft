const VIEWPORT_MARGIN = 10;
const ANCHOR_GAP = 6;

export interface Size {
	width: number;
	height: number;
}

export interface Point {
	x: number;
	y: number;
}

export interface AnchorPlacement {
	left: number;
	top: number | null;
	bottom: number | null;
	maxHeight: number;
	above: boolean;
}

export interface PointPlacement {
	left: number;
	top: number;
	origin: string;
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, max));

export type Align = 'start' | 'end';

export function besideAnchor(anchor: DOMRect, size: Size, maxHeight: number, align: Align): AnchorPlacement {
	const roomBelow = innerHeight - anchor.bottom - ANCHOR_GAP - VIEWPORT_MARGIN;
	const roomAbove = anchor.top - ANCHOR_GAP - VIEWPORT_MARGIN;
	const above = size.height > roomBelow && roomAbove > roomBelow;
	const [preferred, fallback] = align === 'start' ? [anchor.left, anchor.right - size.width] : [anchor.right - size.width, anchor.left];
	const fits = (left: number) => left >= VIEWPORT_MARGIN && left + size.width <= innerWidth - VIEWPORT_MARGIN;
	return {
		left: clamp(fits(preferred) ? preferred : fallback, innerWidth - size.width - VIEWPORT_MARGIN),
		top: above ? null : anchor.bottom + ANCHOR_GAP,
		bottom: above ? innerHeight - anchor.top + ANCHOR_GAP : null,
		maxHeight: Math.min(maxHeight, above ? roomAbove : roomBelow),
		above
	};
}

export function atPoint(point: Point, size: Size): PointPlacement {
	const opensLeft = point.x + size.width + VIEWPORT_MARGIN > innerWidth && point.x - size.width > VIEWPORT_MARGIN;
	const opensUp = point.y + size.height + VIEWPORT_MARGIN > innerHeight && point.y - size.height > VIEWPORT_MARGIN;
	return {
		left: clamp(opensLeft ? point.x - size.width : point.x, innerWidth - size.width - VIEWPORT_MARGIN),
		top: clamp(opensUp ? point.y - size.height : point.y, innerHeight - size.height - VIEWPORT_MARGIN),
		origin: `${opensUp ? 'bottom' : 'top'} ${opensLeft ? 'right' : 'left'}`
	};
}
