import type { ImageDocument } from '#lib/document/image.svelte.js';
import { drawShape, shapeBounds, type ShapeSpec } from '#lib/raster/shapes.js';
import { stamp } from '#lib/raster/stamp.js';
import type { ToolEvent, ToolHandler } from './tool';

export interface ShapeHost {
	doc: ImageDocument;
	spec(from: [number, number], to: [number, number]): ShapeSpec;
	preview(shape: ShapeSpec | null): void;
	label: string;
}

const SNAP = Math.PI / 4;

export class ShapeTool implements ToolHandler {
	readonly cursor = 'crosshair';
	#from: [number, number] | null = null;
	#shape: ShapeSpec | null = null;

	constructor(private readonly host: ShapeHost) {}

	down(event: ToolEvent) {
		if (this.host.doc.active.locked || this.host.doc.active.kind !== 'raster') return;
		this.#from = [event.x, event.y];
	}

	move(event: ToolEvent) {
		if (!this.#from) return;
		let to: [number, number] = [event.x, event.y];
		const spec = this.host.spec(this.#from, to);
		if (event.shift) {
			const [x0, y0] = this.#from;
			if (spec.kind === 'line' || spec.kind === 'arrow') {
				const angle = Math.round(Math.atan2(event.y - y0, event.x - x0) / SNAP) * SNAP;
				const length = Math.hypot(event.x - x0, event.y - y0);
				to = [x0 + Math.cos(angle) * length, y0 + Math.sin(angle) * length];
			} else {
				const side = Math.max(Math.abs(event.x - x0), Math.abs(event.y - y0));
				to = [x0 + side * Math.sign(event.x - x0 || 1), y0 + side * Math.sign(event.y - y0 || 1)];
			}
		}
		this.#shape = this.host.spec(this.#from, to);
		this.host.preview(this.#shape);
	}

	up() {
		const shape = this.#shape;
		this.#from = null;
		this.#shape = null;
		this.host.preview(null);
		if (!shape || Math.hypot(shape.to[0] - shape.from[0], shape.to[1] - shape.from[1]) < 2) return;
		stamp(this.host.doc, this.host.doc.active, this.host.label, shapeBounds(shape), (context) => drawShape(context, shape));
	}
}
