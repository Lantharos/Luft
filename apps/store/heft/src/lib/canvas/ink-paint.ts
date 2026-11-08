import { css, HIGHLIGHTER_OPACITY, onDark } from '#lib/ink/color.js';
import { pathOf } from '#lib/ink/geometry.js';
import { overlaps, type Bounds, type Stroke } from '#lib/ink/stroke.js';

/** While a recording plays, what was written between `after` and `until` on the clock hasn't been written yet. */
export interface Unwritten {
	after: number;
	until: number;
}

export interface Ink {
	dark: boolean;
	unwritten?: Unwritten | null;
}

const UNWRITTEN_OPACITY = 0.18;

export const unwritten = (stroke: Stroke, ink: Ink) => !!ink.unwritten && stroke.started > ink.unwritten.after && stroke.started <= ink.unwritten.until;

const opacity = (stroke: Stroke, ink: Ink) => (stroke.tool === 'highlighter' ? HIGHLIGHTER_OPACITY : 1) * (unwritten(stroke, ink) ? UNWRITTEN_OPACITY : 1);

export const inkColor = (rgb: number, ink: Ink) => css(ink.dark ? onDark(rgb) : rgb);

/** Draws the strokes that touch `area`: highlighters first, under the ink, then pens. */
export function paintStrokes(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, strokes: Stroke[], area: Bounds, ink: Ink) {
	for (const highlighters of [true, false]) {
		for (const stroke of strokes) {
			if ((stroke.tool === 'highlighter') !== highlighters || !overlaps(stroke.bounds, area)) continue;
			context.globalAlpha = opacity(stroke, ink);
			context.fillStyle = inkColor(stroke.color, ink);
			context.fill(pathOf(stroke));
		}
	}
	context.globalAlpha = 1;
}

export function paintStroke(context: CanvasRenderingContext2D, stroke: Stroke, ink: Ink) {
	context.globalAlpha = opacity(stroke, ink);
	context.fillStyle = inkColor(stroke.color, ink);
	context.fill(pathOf(stroke));
	context.globalAlpha = 1;
}
