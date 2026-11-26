import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Rect } from '#lib/gpu/tiles.js';
import { clip, grow, rasterize } from '#lib/raster/mask.js';
import { combineSelection, type SelectMode } from '#lib/raster/selection/selection.js';
import type { Overlay } from '#lib/editor/stage/overlay.js';
import type { ToolEvent, ToolHandler } from './tool';

export interface SelectHost {
	doc: ImageDocument;
	mode(event: ToolEvent): SelectMode;
	feather(): number;
	show(overlay: Overlay | null): void;
	label: string;
}

const MIN_DRAG = 2;

export function modeFor(event: ToolEvent, fallback: SelectMode): SelectMode {
	if (event.shift) return 'add';
	if (event.alt) return 'subtract';
	return fallback;
}

function apply(host: SelectHost, bounds: Rect, mode: SelectMode, paint: (context: OffscreenCanvasRenderingContext2D) => void) {
	const { doc } = host;
	const feather = host.feather();
	const area = clip(grow(bounds, feather * 2 + 2), doc.width, doc.height);
	if (!area) return;
	combineSelection(doc, host.label, rasterize(doc.selection, area, (context) => {
		context.fillStyle = '#fff';
		paint(context);
	}, feather / 2), clip(bounds, doc.width, doc.height) ?? area, mode);
}

export class MarqueeTool implements ToolHandler {
	readonly cursor = 'crosshair';
	#start: [number, number] | null = null;
	#rect: Rect | null = null;
	#mode: SelectMode = 'new';

	constructor(
		private readonly host: SelectHost,
		private readonly shape: () => 'rectangle' | 'ellipse'
	) {}

	down(event: ToolEvent) {
		this.#start = [event.x, event.y];
		this.#mode = this.host.mode(event);
		this.#rect = null;
	}

	move(event: ToolEvent) {
		if (!this.#start) return;
		const [x0, y0] = this.#start;
		let width = event.x - x0;
		let height = event.y - y0;
		if (event.ctrl) {
			const side = Math.max(Math.abs(width), Math.abs(height));
			width = side * Math.sign(width || 1);
			height = side * Math.sign(height || 1);
		}
		this.#rect = { x: Math.min(x0, x0 + width), y: Math.min(y0, y0 + height), width: Math.abs(width), height: Math.abs(height) };
		this.host.show({ kind: 'marquee', shape: this.shape(), rect: this.#rect });
	}

	up() {
		const rect = this.#rect;
		this.#start = null;
		this.host.show(null);
		if (!rect || rect.width < MIN_DRAG || rect.height < MIN_DRAG) {
			if (this.#mode === 'new') this.host.doc.clearSelection(this.host.label);
			return;
		}
		const ellipse = this.shape() === 'ellipse';
		apply(this.host, rect, this.#mode, (context) => {
			if (ellipse) {
				context.beginPath();
				context.ellipse(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
				context.fill();
			} else context.fillRect(rect.x, rect.y, rect.width, rect.height);
		});
	}
}

export class LassoTool implements ToolHandler {
	readonly cursor = 'crosshair';
	#points: number[] = [];
	#mode: SelectMode = 'new';
	#drawing = false;

	constructor(private readonly host: SelectHost) {}

	down(event: ToolEvent) {
		this.#drawing = true;
		this.#mode = this.host.mode(event);
		this.#points = [event.x, event.y];
	}

	move(event: ToolEvent) {
		if (!this.#drawing) return;
		for (const sample of event.samples) this.#points.push(sample.x, sample.y);
		this.host.show({ kind: 'lasso', points: this.#points });
	}

	up() {
		this.#drawing = false;
		this.host.show(null);
		const points = this.#points;
		if (points.length < 6) {
			if (this.#mode === 'new') this.host.doc.clearSelection(this.host.label);
			return;
		}
		const xs = points.filter((_, at) => at % 2 === 0);
		const ys = points.filter((_, at) => at % 2 === 1);
		const left = Math.min(...xs);
		const top = Math.min(...ys);
		const bounds = { x: left, y: top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
		apply(this.host, bounds, this.#mode, (context) => {
			context.beginPath();
			context.moveTo(points[0], points[1]);
			for (let at = 2; at < points.length; at += 2) context.lineTo(points[at], points[at + 1]);
			context.closePath();
			context.fill();
		});
	}
}
