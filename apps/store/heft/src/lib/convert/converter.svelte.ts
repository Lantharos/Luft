import { settings } from '#lib/app/settings.svelte.js';
import { reader } from '#lib/handwriting/reader.svelte.js';
import type { Stroke } from '#lib/ink/stroke.js';
import { cleanHtml, type PageObject } from '#lib/page/objects.js';
import { correct } from './corrections';
import { convert, type Insertion, type Page } from './writing';

const ABOVE = 0.8;
const BELOW = 0.3;
const INSERT_WITHIN = 30_000;

/** Where the next line turned into text goes, after a tap or caret between words. */
export const marked: { insertion: (Insertion & { page: string }) | null } = $state({ insertion: null });

export interface ConverterHost {
	page(id: string): Page | null;
	writing(): boolean;
}

function over(object: PageObject, stroke: Stroke) {
	const line = object.line ?? 24;
	const size = object.size ?? 16;
	const x = (stroke.bounds.left + stroke.bounds.right) / 2;
	const y = (stroke.bounds.top + stroke.bounds.bottom) / 2;
	return x > object.x - size && x < object.x + object.width + size && y > object.y - line * ABOVE && y < object.y + object.height + line * BELOW;
}

/**
 * Turns writing into text when the pen pauses, and applies corrections
 * written over text that came from handwriting. Strokes wait until nobody
 * has written for a moment, then each page's are read together.
 */
export class Converter {
	private readonly pending = new Map<string, Set<string>>();
	private timer = 0;
	private busy = false;

	constructor(private readonly host: ConverterHost) {}

	get ready() {
		return !!reader.model?.installed;
	}

	wrote(page: string, stroke: Stroke) {
		if (stroke.tool !== 'pen' || !this.ready) return;
		const strokes = this.pending.get(page) ?? new Set();
		strokes.add(stroke.id);
		this.pending.set(page, strokes);
		this.wait();
	}

	private wait() {
		clearTimeout(this.timer);
		this.timer = window.setTimeout(() => void this.settle(), settings.values.convertAfter);
	}

	private async settle() {
		if (this.busy || this.host.writing()) return this.wait();
		this.busy = true;
		try {
			for (const [id, strokes] of [...this.pending]) {
				this.pending.delete(id);
				await this.settlePage(id, strokes);
			}
		} finally {
			this.busy = false;
		}
	}

	private async settlePage(id: string, ids: Set<string>) {
		const page = this.host.page(id);

		if (!page) return;
		const strokes = [...ids].map((stroke) => page.document.get(stroke)).filter((stroke) => stroke !== undefined);
		const free: Stroke[] = [];
		const corrections = new Map<PageObject, Stroke[]>();
		for (const stroke of strokes) {
			const object = page.document.objects.find((candidate) => candidate.written && over(candidate, stroke));
			if (object) corrections.set(object, [...(corrections.get(object) ?? []), stroke]);
			else free.push(stroke);
		}
		for (const [object, written] of corrections) free.push(...(await this.correct(page, object, written)));
		if (!settings.values.convert || !free.length) return;
		const insertion = marked.insertion?.page === id ? marked.insertion : null;
		marked.insertion = null;
		await convert(page, free, insertion);
	}

	/** Applies corrections to one text box; the strokes that weren't corrections. */
	private async correct(page: Page, object: PageObject, strokes: Stroke[]) {
		const box = page.element.querySelector<HTMLElement>(`[data-object="${object.id}"]`);
		if (!box) return strokes;
		const { used, insert } = await correct(box, object, strokes, page.zoom);
		const current = page.document.object(object.id);
		if (used.length && current) {
			const html = cleanHtml(box.innerHTML);
			const text = box.innerText.trim();
			page.document.commit({ removed: used, added: [], objects: [{ before: current, after: text ? { ...current, html, text, height: box.offsetHeight } : null }] });
		}
		if (insert !== null) this.mark({ page: page.id, object: object.id, offset: insert });
		return strokes.filter((stroke) => !used.includes(stroke));
	}

	/** Shows where the next line goes, for a while. */
	private mark(insertion: Insertion & { page: string }) {
		marked.insertion = insertion;
		const still = () => marked.insertion?.object === insertion.object && marked.insertion.offset === insertion.offset;
		window.setTimeout(() => still() && (marked.insertion = null), INSERT_WITHIN);
	}

	/** Turns picked ink into text straight away, whatever the setting. */
	async convertNow(page: Page, strokes: Stroke[]) {
		await convert(page, strokes.filter((stroke) => stroke.tool === 'pen'), null);
	}

	destroy() {
		clearTimeout(this.timer);
	}
}
