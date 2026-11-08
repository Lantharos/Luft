import { css, HIGHLIGHTER_OPACITY, onDark } from '#lib/ink/color.js';
import { pathOf } from '#lib/ink/geometry.js';
import { overlaps, type Bounds, type Stroke } from '#lib/ink/stroke.js';

export interface Ink {
	dark: boolean;
}

export const inkColor = (rgb: number, ink: Ink) => css(ink.dark ? onDark(rgb) : rgb);

/** Draws the strokes that touch `area`: highlighters first, under the ink, then pens. */
export function paintStrokes(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, strokes: Stroke[], area: Bounds, ink: Ink) {
	context.globalAlpha = HIGHLIGHTER_OPACITY;
	for (const stroke of strokes) {
		if (stroke.tool !== 'highlighter' || !overlaps(stroke.bounds, area)) continue;
		context.fillStyle = inkColor(stroke.color, ink);
		context.fill(pathOf(stroke));
	}
	context.globalAlpha = 1;
	for (const stroke of strokes) {
		if (stroke.tool === 'highlighter' || !overlaps(stroke.bounds, area)) continue;
		context.fillStyle = inkColor(stroke.color, ink);
		context.fill(pathOf(stroke));
	}
}

export function paintStroke(context: CanvasRenderingContext2D, stroke: Stroke, ink: Ink) {
	context.globalAlpha = stroke.tool === 'highlighter' ? HIGHLIGHTER_OPACITY : 1;
	context.fillStyle = inkColor(stroke.color, ink);
	context.fill(pathOf(stroke));
	context.globalAlpha = 1;
}
