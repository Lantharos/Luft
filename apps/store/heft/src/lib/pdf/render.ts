import { pdfDocument, PAGE_UNITS_PER_POINT } from './document';

export async function pdfImage(path: string, index: number, pixels: number): Promise<HTMLCanvasElement> {
	const page = await (await pdfDocument(path)).getPage(index + 1);
	const base = page.getViewport({ scale: PAGE_UNITS_PER_POINT });
	const viewport = page.getViewport({ scale: (pixels / base.width) * PAGE_UNITS_PER_POINT });
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(viewport.width);
	canvas.height = Math.round(viewport.height);
	await page.render({ canvas, viewport }).promise;
	return canvas;
}
