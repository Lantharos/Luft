import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
import { fileSource } from '#lib/bridge/index.js';

type Library = typeof import('pdfjs-dist');
type Viewer = typeof import('pdfjs-dist/web/pdf_viewer.mjs');

export const DOCUMENT_SCOPE = 'pdf-document';

let modules: Promise<{ library: Library; viewer: Viewer }> | null = null;

export function pdfModules() {
	modules ??= (async () => {
		const library = await import('pdfjs-dist');
		library.GlobalWorkerOptions.workerSrc = workerUrl;
		(globalThis as { pdfjsLib?: Library }).pdfjsLib = library;
		const [viewer, styles] = await Promise.all([import('pdfjs-dist/web/pdf_viewer.mjs'), import('pdfjs-dist/web/pdf_viewer.css?inline')]);
		scopeStyles(styles.default);
		return { library, viewer };
	})();
	return modules;
}

function scopeStyles(css: string) {
	const style = document.createElement('style');
	style.textContent = `@layer pdfjs { @scope (.${DOCUMENT_SCOPE}) { ${css.replaceAll(':root', ':scope')} } }`;
	document.head.append(style);
}

export async function openDocument(path: string, version: number): Promise<PDFDocumentLoadingTask> {
	const [{ library }, data] = await Promise.all([
		pdfModules(),
		fetch(fileSource(path, version)).then((response) => response.arrayBuffer())
	]);
	return library.getDocument({
		data: new Uint8Array(data),
		cMapUrl: '/pdfjs/cmaps/',
		cMapPacked: true,
		standardFontDataUrl: '/pdfjs/standard_fonts/',
		wasmUrl: '/pdfjs/wasm/',
		iccUrl: '/pdfjs/iccs/'
	});
}
