export const FORMAT = 1;

export type Template = 'blank' | 'lined' | 'grid' | 'dotted' | 'cornell' | 'staff';
export type PaperSize = 'a4' | 'a5' | 'letter' | 'infinite';
export type PaperColor = 'white' | 'cream' | 'dark';

export interface Paper {
	template: Template;
	size: PaperSize;
	landscape: boolean;
	color: PaperColor;
	/** Line or grid spacing in millimetres. */
	spacing: number;
}

export interface PdfBacking {
	source: string;
	index: number;
	width: number;
	height: number;
}

export interface PageEntry {
	id: string;
	created: number;
	paper?: Partial<Paper>;
	pdf?: PdfBacking;
	/** How far an infinite page has grown, in page units. */
	height?: number;
}

export interface Section {
	id: string;
	title: string;
	page: string;
}

export interface NotebookMeta {
	format: number;
	id: string;
	name: string;
	kind: 'notes' | 'book';
	subject: string;
	paper: Paper;
	pages: PageEntry[];
	sections: Section[];
	created: number;
	modified: number;
	favorite?: boolean;
	/** Deleted pages, kept with where they were so they can come back. */
	trashed?: { page: PageEntry; index: number; at: number }[];
}

export interface SubjectMeta {
	format: number;
	id: string;
	name: string;
	color: string;
	icon: string;
	order: number;
	archived?: boolean;
}

export const MM = 96 / 25.4;

const SIZES: Record<Exclude<PaperSize, 'infinite'>, [number, number]> = {
	a4: [210, 297],
	a5: [148, 210],
	letter: [215.9, 279.4]
};

export const DEFAULT_PAPER: Paper = { template: 'lined', size: 'a4', landscape: false, color: 'white', spacing: 8 };

export function paperOf(notebook: NotebookMeta, page: PageEntry): Paper {
	return { ...notebook.paper, ...page.paper };
}

export function pageSize(paper: Paper, page: PageEntry): { width: number; height: number } {
	if (page.pdf) return { width: page.pdf.width, height: page.pdf.height };
	const [shortSide, longSide] = SIZES[paper.size === 'infinite' ? 'a4' : paper.size];
	const [width, height] = paper.landscape && paper.size !== 'infinite' ? [longSide, shortSide] : [shortSide, longSide];
	return { width: width * MM, height: paper.size === 'infinite' ? Math.max(page.height ?? 0, height * MM) : height * MM };
}
