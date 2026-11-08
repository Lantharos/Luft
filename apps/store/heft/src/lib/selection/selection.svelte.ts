import { emptyBounds, newId, POINT_FIELDS, strokeBounds, union, type Bounds, type Stroke } from '#lib/ink/stroke.js';
import type { PageDocument } from '#lib/page/document.js';

export interface Transform {
	dx: number;
	dy: number;
	scale: number;
	angle: number;
}

const IDENTITY: Transform = { dx: 0, dy: 0, scale: 1, angle: 0 };

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

/** Ink picked with the lasso, and what can be done with it. */
class Selection {
	page: string | null = $state(null);
	strokes: Stroke[] = $state.raw([]);
	bounds: Bounds = $state.raw(emptyBounds());
	transform: Transform = $state.raw(IDENTITY);
	private document: PageDocument | null = null;
	private shown: Stroke[] = [];

	get active() {
		return this.strokes.length > 0;
	}

	pick(page: string, document: PageDocument, polygon: [number, number][]) {
		const strokes = document.strokes.filter((stroke) => {
			let hits = 0;
			for (let index = 0; index < stroke.points.length; index += POINT_FIELDS) {
				if (inside(polygon, stroke.points[index], stroke.points[index + 1])) hits++;
			}
			return hits / (stroke.points.length / POINT_FIELDS) >= 0.6;
		});
		this.set(page, document, strokes);
	}

	private set(page: string, document: PageDocument, strokes: Stroke[]) {
		this.page = strokes.length ? page : null;
		this.document = document;
		this.strokes = strokes;
		this.shown = strokes;
		this.bounds = boundsOf(strokes);
		this.transform = IDENTITY;
	}

	clear() {
		this.page = null;
		this.document = null;
		this.strokes = [];
		this.shown = [];
		this.transform = IDENTITY;
	}

	private get center(): [number, number] {
		return [(this.bounds.left + this.bounds.right) / 2, (this.bounds.top + this.bounds.bottom) / 2];
	}

	/** Shows the ink moved, scaled or turned, while a handle is being dragged. */
	preview(transform: Transform) {
		if (!this.document) return;
		this.transform = transform;
		const next = this.strokes.map((stroke) => transformed(stroke, transform, this.center));
		this.document.preview({ removed: this.shown, added: next });
		this.shown = next;
	}

	/** Keeps the moved ink as one change that can be undone. */
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

	/** Puts copied ink on a page, a little below and to the right of where it was. */
	paste(page: string, document: PageDocument) {
		if (!clipboard.length) return;
		let order = document.lastOrder;
		const pasted = clipboard.map((stroke) => ({ ...transformed(stroke, { ...IDENTITY, dx: 18, dy: 18 }, [0, 0], newId()), order: ++order }));
		document.commit({ removed: [], added: pasted });
		clipboard = pasted;
		this.set(page, document, pasted);
	}

	get hasCopy() {
		return clipboard.length > 0;
	}
}

export const selection = new Selection();
