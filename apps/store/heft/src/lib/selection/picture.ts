import { paintStrokes, type Ink } from '#lib/canvas/ink-paint.js';
import type { Bounds, Stroke } from '#lib/ink/stroke.js';
import { pdfImage } from '#lib/pdf/render.js';

const SHARPNESS = 2;
const LIMIT = 2400;

export interface Region {
	bounds: Bounds;
	strokes: Stroke[];
	ink: Ink;
	pageWidth: number;
	pdf?: { path: string; index: number };
}

/** A part of a page drawn as a picture: the printed book page under it, if any, and the ink on it. */
export async function regionPicture({ bounds, strokes, ink, pageWidth, pdf }: Region): Promise<HTMLCanvasElement> {
	const width = bounds.right - bounds.left;
	const height = bounds.bottom - bounds.top;
	const scale = Math.min(SHARPNESS, LIMIT / Math.max(width, height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(width * scale));
	canvas.height = Math.max(1, Math.round(height * scale));
	const context = canvas.getContext('2d')!;
	if (pdf) {
		const page = await pdfImage(pdf.path, pdf.index, Math.round(pageWidth * scale));
		const ratio = page.width / pageWidth;
		context.drawImage(page, bounds.left * ratio, bounds.top * ratio, width * ratio, height * ratio, 0, 0, canvas.width, canvas.height);
	}
	context.setTransform(scale, 0, 0, scale, -bounds.left * scale, -bounds.top * scale);
	paintStrokes(context, strokes, bounds, ink);
	return canvas;
}
