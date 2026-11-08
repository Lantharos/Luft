import { paintStrokes } from '#lib/canvas/ink-paint.js';
import type { Paper } from '#lib/library/model.js';
import type { PageDocument } from '#lib/page/document.js';
import { LOOKS, ruling } from '#lib/paper/templates.js';

const EVERYTHING = { left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity };

/** Draws a whole page small: its paper, its rules and its ink. */
export function paintThumbnail(canvas: HTMLCanvasElement, paper: Paper, size: { width: number; height: number }, document: PageDocument | null, background?: CanvasImageSource) {
	const context = canvas.getContext('2d')!;
	const scale = canvas.width / size.width;
	const look = LOOKS[paper.color];
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.fillStyle = look.background;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.setTransform(scale, 0, 0, scale, 0, 0);
	if (background) context.drawImage(background, 0, 0, size.width, size.height);
	else {
		const rules = ruling(paper, size.width, size.height);
		context.lineWidth = 1 / scale;
		context.strokeStyle = look.line;
		if (rules.lines) context.stroke(new Path2D(rules.lines));
		if (rules.accents) {
			context.strokeStyle = paper.template === 'lined' ? look.accent : look.line;
			context.stroke(new Path2D(rules.accents));
		}
	}
	if (document) paintStrokes(context, document.strokes, EVERYTHING, { dark: look.dark });
}
