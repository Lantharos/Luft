import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { fileUrl } from '@lantharos/sabine';
import type { PDFDocumentProxy } from 'pdfjs-dist';

type Library = typeof import('pdfjs-dist');

let library: Promise<Library> | null = null;
const documents = new Map<string, Promise<PDFDocumentProxy>>();

function pdfLibrary(): Promise<Library> {
	library ??= import('pdfjs-dist').then((module) => {
		module.GlobalWorkerOptions.workerSrc = workerUrl;
		return module;
	});
	return library;
}

export function pdfDocument(path: string): Promise<PDFDocumentProxy> {
	let pending = documents.get(path);
	if (!pending) {
		pending = pdfLibrary().then(
			(module) =>
				module.getDocument({
					url: fileUrl(path),
					disableAutoFetch: true,
					rangeChunkSize: 256 * 1024,
					cMapUrl: '/pdfjs/cmaps/',
					cMapPacked: true,
					standardFontDataUrl: '/pdfjs/standard_fonts/',
					wasmUrl: '/pdfjs/wasm/',
					iccUrl: '/pdfjs/iccs/'
				}).promise
		);
		documents.set(path, pending);
	}
	return pending;
}

export const PAGE_UNITS_PER_POINT = 96 / 72;
