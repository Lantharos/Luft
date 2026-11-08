import { pdfDocument, POINTS } from './document';

/** A book page drawn `pixels` wide, for a thumbnail or an export. */
export async function pdfImage(path: string, index: number, pixels: number): Promise<HTMLCanvasElement> {
	const page = await (await pdfDocument(path)).getPage(index + 1);
	const base = page.getViewport({ scale: POINTS });
	const viewport = page.getViewport({ scale: (pixels / base.width) * POINTS });
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(viewport.width);
	canvas.height = Math.round(viewport.height);
	await page.render({ canvas, viewport }).promise;
	return canvas;
}
