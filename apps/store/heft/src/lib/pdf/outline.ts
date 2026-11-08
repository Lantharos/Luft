import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { pdfDocument } from './document';
import { sourcePath } from './sources';

export interface Heading {
	title: string;
	depth: number;
	/** The page in the notebook, or -1 when the book's page was deleted. */
	page: number;
}

type Outline = Awaited<ReturnType<Awaited<ReturnType<typeof pdfDocument>>['getOutline']>>;

/** The books' tables of contents, pointing at pages of this notebook. */
export async function notebookOutline(notebook: OpenNotebook): Promise<Heading[]> {
	const sources = [...new Set(notebook.meta.pages.flatMap((page) => (page.pdf ? [page.pdf.source] : [])))];
	const headings: Heading[] = [];
	for (const source of sources) {
		const document = await pdfDocument(sourcePath(notebook, source));
		const pageOf = (pdfIndex: number) => notebook.meta.pages.findIndex((page) => page.pdf?.source === source && page.pdf.index === pdfIndex);
		const walk = async (items: Outline, depth: number) => {
			for (const item of items ?? []) {
				const destination = typeof item.dest === 'string' ? await document.getDestination(item.dest) : item.dest;
				const reference = destination?.[0];
				const index = reference && typeof reference === 'object' ? await document.getPageIndex(reference) : typeof reference === 'number' ? reference : -1;
				headings.push({ title: item.title, depth, page: index < 0 ? -1 : pageOf(index) });
				await walk(item.items, depth + 1);
			}
		};
		await walk(await document.getOutline(), 0);
	}
	return headings;
}
