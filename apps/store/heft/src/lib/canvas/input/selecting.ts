import { textSelection } from '#lib/pdf/selection.svelte.js';
import { pageText, select, type Glyphs } from '#lib/pdf/text.js';
import { pagePoint, type Origin, type Target } from './drawing';
import type { Viewport } from '../viewport.svelte';

type Sample = Pick<PointerEvent, 'clientX' | 'clientY'>;

/** Dragging across a book page's printed text to pick some of it. */
export class TextPicking {
	private glyphs: Glyphs[] | null = null;
	private readonly from: [number, number];
	private to: [number, number];

	constructor(
		private readonly viewport: Viewport,
		private readonly origin: Origin,
		private readonly target: Target,
		pdf: { path: string; index: number },
		first: PointerEvent
	) {
		this.from = this.point(first);
		this.to = this.from;
		textSelection.clear();
		void pageText(pdf.path, pdf.index).then((glyphs) => {
			this.glyphs = glyphs;
			this.show();
		});
	}

	private point(sample: Sample): [number, number] {
		return pagePoint(this.viewport, this.origin, this.target.page, sample);
	}

	move(sample: Sample) {
		this.to = this.point(sample);
		this.show();
	}

	private show() {
		if (!this.glyphs || this.to === this.from) return;
		textSelection.show(this.target.id, this.target.document, select(this.glyphs, this.from, this.to));
	}

	end() {
		if (!textSelection.selection.text) textSelection.clear();
	}
}
