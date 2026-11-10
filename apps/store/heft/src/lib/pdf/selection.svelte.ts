import { newId, POINT_FIELDS, strokeBounds, type Stroke } from '#lib/ink/stroke.js';
import type { PageDocument } from '#lib/page/document.js';
import type { Selection } from './text';

class TextSelection {
	page: string | null = $state(null);
	selection: Selection = $state({ rects: [], text: '' });
	document: PageDocument | null = null;

	show(page: string, document: PageDocument, selection: Selection) {
		this.page = page;
		this.document = document;
		this.selection = selection;
	}

	clear() {
		this.page = null;
		this.document = null;
		this.selection = { rects: [], text: '' };
	}

	highlight(color: number) {
		const document = this.document;
		if (!document) return;
		let order = document.lastOrder;
		const strokes: Stroke[] = this.selection.rects.map((rect) => {
			const radius = rect.height / 2;
			const y = rect.top + radius;
			const left = rect.left + Math.min(radius, rect.width / 2);
			const right = Math.max(left, rect.left + rect.width - radius);
			const points = new Float32Array(2 * POINT_FIELDS);
			points.set([left, y, rect.height, 0.5, 0, right, y, rect.height, 0.5, 0]);
			return { id: newId(), order: ++order, tool: 'highlighter', nib: 'ballpoint', color, width: rect.height, started: Date.now(), points, bounds: strokeBounds(points) };
		});
		document.commit({ removed: [], added: strokes });
		this.clear();
	}
}

export const textSelection = new TextSelection();
