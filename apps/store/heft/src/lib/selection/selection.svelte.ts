import { emptyBounds, newId, POINT_FIELDS, strokeBounds, union, type Bounds, type Stroke } from '#lib/ink/stroke.js';
import type { PageDocument } from '#lib/page/document.js';

export interface Transform {
	dx: number;
	dy: number;
	scale: number;
	angle: number;
}

export const IDENTITY: Transform = { dx: 0, dy: 0, scale: 1, angle: 0 };

let clipboard: Stroke[] = [];

function inside(polygon: [number, number][], x: number, y: number) {
	let hit = false;
	for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
		const [xi, yi] = polygon[index];
		const [xj, yj] = polygon[previous];
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
	}
	return hit;
}

function boundsOf(strokes: Stroke[]): Bounds {
	const bounds = emptyBounds();
	for (const stroke of strokes) union(bounds, stroke.bounds);
	return bounds;
}

function polygonBounds(polygon: [number, number][]): Bounds {
	const bounds = emptyBounds();
	for (const [x, y] of polygon) union(bounds, { left: x, top: y, right: x, bottom: y });
	return bounds;
}

export function copied(strokes: Stroke[], dx: number, dy: number, order: number): Stroke[] {
	return strokes.map((stroke) => ({ ...transformed(stroke, { ...IDENTITY, dx, dy }, [0, 0], newId()), order: ++order }));
}

function transformed(stroke: Stroke, transform: Transform, center: [number, number], id = stroke.id): Stroke {
	const { dx, dy, scale, angle } = transform;
	const [cx, cy] = center;
	const cos = Math.cos(angle) * scale;
	const sin = Math.sin(angle) * scale;
	const points = stroke.points.slice();
	for (let index = 0; index < points.length; index += POINT_FIELDS) {
		const x = points[index] - cx;
		const y = points[index + 1] - cy;
		points[index] = cx + dx + x * cos - y * sin;
		points[index + 1] = cy + dy + x * sin + y * cos;
		points[index + 2] *= scale;
	}
	return { ...stroke, id, points, width: stroke.width * scale, bounds: strokeBounds(points), path: undefined };
}

class Selection {
	page: string | null = $state(null);
	strokes: Stroke[] = $state.raw([]);
	bounds: Bounds = $state.raw(emptyBounds());
	transform: Transform = $state.raw(IDENTITY);
	book = $state(false);
	private document: PageDocument | null = null;
	private shown: Stroke[] = [];

	get active() {
		return this.page !== null;
	}

	get ink() {
		return this.strokes.length > 0;
	}

	pick(page: string, document: PageDocument, polygon: [number, number][], book: boolean) {
		const strokes = document.strokes.filter((stroke) => {
			let hits = 0;
			for (let index = 0; index < stroke.points.length; index += POINT_FIELDS) {
				if (inside(polygon, stroke.points[index], stroke.points[index + 1])) hits++;
			}
			return hits / (stroke.points.length / POINT_FIELDS) >= 0.6;
		});
		this.set(page, document, strokes, book);
		if (book) this.bounds = polygonBounds(polygon);
	}

	private set(page: string, document: PageDocument, strokes: Stroke[], book = false) {
		this.page = strokes.length || book ? page : null;
		this.book = book;
		this.document = document;
		this.strokes = strokes;
		this.shown = strokes;
		this.bounds = boundsOf(strokes);
		this.transform = IDENTITY;
	}

	clear() {
		this.page = null;
		this.book = false;
		this.document = null;
		this.strokes = [];
		this.shown = [];
		this.transform = IDENTITY;
	}

	private get center(): [number, number] {
		return [(this.bounds.left + this.bounds.right) / 2, (this.bounds.top + this.bounds.bottom) / 2];
	}

	preview(transform: Transform) {
		if (!this.document) return;
		this.transform = transform;
		const next = this.strokes.map((stroke) => transformed(stroke, transform, this.center));
		this.document.preview({ removed: this.shown, added: next });
		this.shown = next;
	}

	settle() {
		if (!this.document || this.transform === IDENTITY) return;
		this.document.record({ removed: this.strokes, added: this.shown });
		this.set(this.page!, this.document, this.shown);
	}

	recolor(color: number) {
		if (!this.document) return;
		const next = this.strokes.map((stroke) => ({ ...stroke, color }));
		this.document.commit({ removed: this.strokes, added: next });
		this.set(this.page!, this.document, next);
	}

	remove() {
		this.document?.commit({ removed: this.strokes, added: [] });
		this.clear();
	}

	copy() {
		clipboard = this.strokes;
	}

	cut() {
		this.copy();
		this.remove();
	}

	duplicate() {
		this.copy();
		if (this.document) this.paste(this.page!, this.document);
	}

	paste(page: string, document: PageDocument) {
		if (!clipboard.length) return;
		const order = document.lastOrder;
		const pasted = copied(clipboard, 18, 18, order);
		document.commit({ removed: [], added: pasted });
		clipboard = pasted;
		this.set(page, document, pasted);
	}

	get hasCopy() {
		return clipboard.length > 0;
	}
}

export const selection = new Selection();
