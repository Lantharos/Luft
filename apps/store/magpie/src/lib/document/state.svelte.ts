import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { EventBus, PDFViewer } from 'pdfjs-dist/web/pdf_viewer.mjs';

export type Fit = 'page-width' | 'page-fit' | null;

class DocumentState {
	document = $state.raw<PDFDocumentProxy | null>(null);
	viewer = $state.raw<PDFViewer | null>(null);
	pages = $state(0);
	page = $state(1);
	scale = $state(1);
	fit = $state<Fit>('page-width');
	finding = $state(false);
	query = $state('');
	matches = $state({ current: 0, total: 0 });
	bus: EventBus | null = null;

	goTo(page: number) {
		if (this.viewer) this.viewer.currentPageNumber = Math.min(this.pages, Math.max(1, page));
	}

	setFit(fit: Exclude<Fit, null>) {
		if (!this.viewer) return;
		this.viewer.currentScaleValue = fit;
		this.fit = fit;
	}

	zoom(steps: number) {
		this.viewer?.updateScale({ steps });
		this.fit = null;
	}

	find(previous = false, again = true) {
		this.bus?.dispatch('find', {
			source: null,
			type: again ? 'again' : '',
			query: this.query,
			caseSensitive: false,
			entireWord: false,
			highlightAll: true,
			findPrevious: previous,
			matchDiacritics: false
		});
	}

	closeFind() {
		this.finding = false;
		this.query = '';
		this.matches = { current: 0, total: 0 };
		this.find(false, false);
	}

	reset() {
		this.document = null;
		this.viewer = null;
		this.pages = 0;
		this.page = 1;
		this.finding = false;
		this.query = '';
		this.matches = { current: 0, total: 0 };
		this.bus = null;
	}
}

export const documentState = new DocumentState();
