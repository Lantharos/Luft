import type { Change, PageDocument } from '#lib/page/document.js';
import { distanceToSegment } from './geometry';
import { newId, overlaps, POINT_FIELDS, strokeBounds, type Bounds, type Stroke } from './stroke';

export type EraseMode = 'stroke' | 'area';

function touches(stroke: Stroke, x: number, y: number, radius: number): boolean {
	const points = stroke.points;
	if (points.length === POINT_FIELDS) return Math.hypot(points[0] - x, points[1] - y) <= radius + points[2] / 2;
	for (let index = POINT_FIELDS; index < points.length; index += POINT_FIELDS) {
		const reach = radius + Math.max(points[index + 2], points[index - POINT_FIELDS + 2]) / 2;
		if (distanceToSegment(x, y, points[index - POINT_FIELDS], points[index - POINT_FIELDS + 1], points[index], points[index + 1]) <= reach) return true;
	}
	return false;
}

/** The stroke's points with extra ones in between, so none is further than `step` from the next. */
function resampled(points: Float32Array, step: number): number[] {
	const out: number[] = [];
	for (let index = 0; index < points.length; index += POINT_FIELDS) {
		if (index > 0) {
			const previous = index - POINT_FIELDS;
			const pieces = Math.ceil(Math.hypot(points[index] - points[previous], points[index + 1] - points[previous + 1]) / step);
			for (let piece = 1; piece < pieces; piece++) {
				const along = piece / pieces;
				for (let field = 0; field < 4; field++) out.push(points[previous + field] + (points[index + field] - points[previous + field]) * along);
				out.push(0);
			}
		}
		for (let field = 0; field < POINT_FIELDS; field++) out.push(points[index + field]);
	}
	return out;
}

function cut(stroke: Stroke, x: number, y: number, radius: number): Stroke[] {
	const points = resampled(stroke.points, Math.max(radius / 2, 0.5));
	const pieces: Stroke[] = [];
	let run: number[] = [];
	const close = () => {
		if (run.length) {
			const kept = new Float32Array(run);
			pieces.push({ ...stroke, id: newId(), order: stroke.order + (pieces.length + 1) * 1e-6, points: kept, bounds: strokeBounds(kept), path: undefined });
		}
		run = [];
	};
	for (let index = 0; index < points.length; index += POINT_FIELDS) {
		if (Math.hypot(points[index] - x, points[index + 1] - y) <= radius + points[index + 2] / 2) close();
		else for (let field = 0; field < POINT_FIELDS; field++) run.push(points[index + field]);
	}
	close();
	return pieces;
}

export class EraseGesture {
	private readonly originals = new Map<string, Stroke>();
	private readonly pieces = new Map<string, Stroke>();
	private last: [number, number] | null = null;

	constructor(
		private readonly document: PageDocument,
		private readonly mode: EraseMode,
		private readonly radius: number
	) {}

	/** Erases along the way from the last position to this one. */
	moveTo(x: number, y: number) {
		const [fromX, fromY] = this.last ?? [x, y];
		this.last = [x, y];
		const steps = Math.max(1, Math.ceil(Math.hypot(x - fromX, y - fromY) / (this.radius / 2)));
		const sweep: Bounds = {
			left: Math.min(x, fromX) - this.radius,
			top: Math.min(y, fromY) - this.radius,
			right: Math.max(x, fromX) + this.radius,
			bottom: Math.max(y, fromY) + this.radius
		};
		for (let step = 1; step <= steps; step++) {
			const along = step / steps;
			this.eraseAt(fromX + (x - fromX) * along, fromY + (y - fromY) * along, sweep);
		}
	}

	private eraseAt(x: number, y: number, sweep: Bounds) {
		const removed: Stroke[] = [];
		const added: Stroke[] = [];
		for (const stroke of this.document.strokes) {
			if (!overlaps(stroke.bounds, sweep) || !touches(stroke, x, y, this.radius)) continue;
			removed.push(stroke);
			if (this.mode === 'area') added.push(...cut(stroke, x, y, this.radius));
		}
		if (!removed.length) return;
		for (const stroke of removed) {
			if (!this.pieces.delete(stroke.id)) this.originals.set(stroke.id, stroke);
		}
		for (const stroke of added) this.pieces.set(stroke.id, stroke);
		this.document.preview({ removed, added });
	}

	finish(): Change {
		return { removed: [...this.originals.values()], added: [...this.pieces.values()] };
	}
}
