import { HIGHLIGHTER_OPACITY } from '#lib/ink/color.js';
import { addDot, addSegment, strokePath } from '#lib/ink/geometry.js';
import { emptyBounds, grow, POINT_FIELDS, type Bounds, type Tool } from '#lib/ink/stroke.js';

export interface Placement {
	zoom: number;
	left: number;
	top: number;
	width: number;
	height: number;
}

/**
 * The stroke being drawn, on a canvas of its own over the notebook. Each new
 * sample draws only its own segment; the predicted tail sits on a second
 * canvas that is the only thing cleared while the pen moves.
 */
export class LiveInk {
	private readonly context: CanvasRenderingContext2D;
	private readonly predictContext: CanvasRenderingContext2D;
	private scale = 1;
	private placement: Placement = { zoom: 1, left: 0, top: 0, width: 0, height: 0 };
	private drawn = emptyBounds();
	private predicted: Bounds | null = null;

	constructor(
		private readonly canvas: HTMLCanvasElement,
		private readonly predictCanvas: HTMLCanvasElement
	) {
		this.context = canvas.getContext('2d', { desynchronized: true })!;
		this.predictContext = predictCanvas.getContext('2d', { desynchronized: true })!;
	}

	resize(width: number, height: number, scale: number) {
		this.scale = scale;
		for (const canvas of [this.canvas, this.predictCanvas]) {
			canvas.width = Math.ceil(width * scale);
			canvas.height = Math.ceil(height * scale);
		}
	}

	begin(placement: Placement, color: string, tool: Tool) {
		this.placement = placement;
		this.drawn = emptyBounds();
		const opacity = tool === 'highlighter' ? String(HIGHLIGHTER_OPACITY) : '';
		this.canvas.style.opacity = opacity;
		this.predictCanvas.style.opacity = opacity;
		for (const context of [this.context, this.predictContext]) {
			this.place(context);
			context.fillStyle = color;
		}
	}

	private place(context: CanvasRenderingContext2D) {
		const { zoom, left, top, width, height } = this.placement;
		const factor = zoom * this.scale;
		context.save();
		context.setTransform(factor, 0, 0, factor, left * this.scale, top * this.scale);
		context.beginPath();
		context.rect(0, 0, width, height);
		context.clip();
	}

	/** Draws the points from `from` on, joined to the one before it. */
	draw(points: Float32Array, from: number) {
		const path = new Path2D();
		for (let index = from * POINT_FIELDS; index < points.length; index += POINT_FIELDS) {
			const x = points[index];
			const y = points[index + 1];
			const radius = points[index + 2] / 2;
			if (index === 0) addDot(path, x, y, radius);
			else addSegment(path, points[index - POINT_FIELDS], points[index - POINT_FIELDS + 1], points[index - POINT_FIELDS + 2] / 2, x, y, radius);
			addDot(path, x, y, radius);
			grow(this.drawn, x, y, radius);
		}
		this.context.fill(path);
	}

	/** Shows where the pen is about to be, from the last drawn point. */
	predict(points: Float32Array) {
		this.clearPredicted();
		if (points.length <= POINT_FIELDS) return;
		const bounds = emptyBounds();
		for (let index = 0; index < points.length; index += POINT_FIELDS) grow(bounds, points[index], points[index + 1], points[index + 2] / 2);
		this.predictContext.fill(strokePath(points, 1));
		this.predicted = bounds;
	}

	private clearPredicted() {
		if (!this.predicted) return;
		this.clear(this.predictContext, this.predicted);
		this.predicted = null;
	}

	private clear(context: CanvasRenderingContext2D, bounds: Bounds) {
		context.clearRect(bounds.left - 2, bounds.top - 2, bounds.right - bounds.left + 4, bounds.bottom - bounds.top + 4);
	}

	end() {
		this.clearPredicted();
		this.clear(this.context, this.drawn);
		this.drawn = emptyBounds();
		this.context.restore();
		this.predictContext.restore();
	}
}
