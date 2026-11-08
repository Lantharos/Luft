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

/**
 * A PDF opened in pdf.js's worker. Only the parts of the file that the pages
 * on screen need are read, so a scanned 300-page book opens as fast as a short one.
 */
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

/** Page units are CSS pixels at 96 per inch; PDF points are 72 per inch. */
export const POINTS = 96 / 72;
