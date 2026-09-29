import type { PDFDocumentProxy } from 'pdfjs-dist';
import { documentState } from './state.svelte';

type Viewer = typeof import('pdfjs-dist/web/pdf_viewer.mjs');
type Matches = { matchesCount: { current: number; total: number } };

const MAX_CANVAS_PIXELS = 2 ** 25;

export function showDocument(module: Viewer, container: HTMLDivElement, pages: HTMLDivElement, document: PDFDocumentProxy) {
	const eventBus = new module.EventBus();
	const linkService = new module.PDFLinkService({ eventBus });
	const findController = new module.PDFFindController({ eventBus, linkService });
	const viewer = new module.PDFViewer({
		container,
		viewer: pages,
		eventBus,
		linkService,
		findController,
		removePageBorders: true,
		maxCanvasPixels: MAX_CANVAS_PIXELS
	});
	linkService.setViewer(viewer);
	eventBus.on('pagesinit', () => (viewer.currentScaleValue = documentState.fit ?? 'page-width'));
	eventBus.on('pagechanging', ({ pageNumber }: { pageNumber: number }) => (documentState.page = pageNumber));
	eventBus.on('scalechanging', ({ scale }: { scale: number }) => (documentState.scale = scale));
	eventBus.on('updatefindmatchescount', ({ matchesCount }: Matches) => (documentState.matches = matchesCount));
	eventBus.on('updatefindcontrolstate', ({ matchesCount }: Matches) => (documentState.matches = matchesCount));
	viewer.setDocument(document);
	linkService.setDocument(document);
	documentState.bus = eventBus;
	documentState.document = document;
	documentState.viewer = viewer;
	documentState.pages = document.numPages;
	const observer = new ResizeObserver(() => {
		if (documentState.fit) viewer.currentScaleValue = documentState.fit;
	});
	observer.observe(container);
	return () => observer.disconnect();
}
