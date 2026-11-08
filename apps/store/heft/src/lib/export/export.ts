import { t } from '@luft/i18n';
import { exportFile } from '#lib/bridge/files.js';
import { commands } from '#lib/bindings.js';
import { pageSize, paperOf, type PageEntry } from '#lib/library/model.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { pdfImage } from '#lib/pdf/render.js';
import { sourcePath } from '#lib/pdf/sources.js';
import { paintThumbnail } from '#lib/rail/thumbnail.js';
import { library } from '#lib/library/library.svelte.js';
import { LOOKS } from '#lib/paper/templates.js';
import { pdfPage, pictureCanvas, textCanvas, type ExportOptions } from './pages';
import { PdfWriter } from './writer';

const PNG_SCALE = 2;

async function save(name: string, extension: 'pdf' | 'png', bytes: () => Promise<Uint8Array>) {
	const path = await commands.chooseSave({
		title: t('export-title'),
		filter: extension === 'pdf' ? t('export-pdf-filter') : t('export-png-filter'),
		name,
		extension
	});
	if (path) await exportFile(path, await bytes());
}

/** Pages as a PDF whose ink stays sharp at any size. */
export function exportPdf(notebook: OpenNotebook, pages: PageEntry[], name: string, options: ExportOptions) {
	return save(name, 'pdf', async () => {
		const drawn = [];
		for (const page of pages) drawn.push(await pdfPage(notebook, page, options));
		return new PdfWriter().write(drawn);
	});
}

/** One page as a picture, twice the size it has on screen at 100 %. */
export function exportPng(notebook: OpenNotebook, page: PageEntry, name: string) {
	return save(name, 'png', async () => {
		const paper = paperOf(notebook.meta, page);
		const size = pageSize(paper, page);
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(size.width * PNG_SCALE);
		canvas.height = Math.round(size.height * PNG_SCALE);
		const background = page.pdf ? await pdfImage(sourcePath(notebook, page.pdf.source), page.pdf.index, canvas.width) : undefined;
		const ink = (await notebook.load(page.id)).document;
		paintThumbnail(canvas, paper, size, ink, background);
		const context = canvas.getContext('2d')!;
		context.setTransform(PNG_SCALE, 0, 0, PNG_SCALE, 0, 0);
		for (const object of ink.objects) {
			const drawn = object.kind === 'text' ? await textCanvas(object, LOOKS[paper.color].dark) : await pictureCanvas(`${library.root}/${notebook.folder}/assets/${object.asset}`);
			context.drawImage(drawn, object.x, object.y, object.width, object.kind === 'text' ? drawn.height / 2 : object.height);
		}
		const blob = await new Promise<Blob>((resolve) => canvas.toBlob((made) => resolve(made!), 'image/png'));
		return new Uint8Array(await blob.arrayBuffer());
	});
}
