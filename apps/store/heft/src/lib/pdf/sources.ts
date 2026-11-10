import { commands } from '#lib/bindings.js';
import { newId } from '#lib/ink/stroke.js';
import { library } from '#lib/library/library.svelte.js';
import type { PageEntry } from '#lib/library/model.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { pdfDocument, PAGE_UNITS_PER_POINT } from './document';

export const sourcePath = (notebook: OpenNotebook | { folder: string }, source: string) => `${library.root}/${notebook.folder}/sources/${source}`;

const fileName = (path: string) => path.slice(path.lastIndexOf('/') + 1);

export const bookName = (path: string) => fileName(path).replace(/\.pdf$/i, '');

export async function pdfPages(folder: string, path: string): Promise<PageEntry[]> {
	const source = `${newId()}-${fileName(path)}`;
	await commands.importFile({ source: path, to: `${folder}/sources/${source}` });
	const document = await pdfDocument(sourcePath({ folder }, source));
	const now = Date.now();
	const pages: PageEntry[] = [];
	for (let index = 0; index < document.numPages; index++) {
		const viewport = (await document.getPage(index + 1)).getViewport({ scale: PAGE_UNITS_PER_POINT });
		pages.push({ id: newId(), created: now, pdf: { source, index, width: viewport.width, height: viewport.height } });
	}
	return pages;
}

export async function insertPdf(notebook: OpenNotebook, path: string, at: number) {
	const pages = await pdfPages(notebook.folder, path);
	notebook.meta.pages.splice(at, 0, ...pages);
	notebook.changed();
}
