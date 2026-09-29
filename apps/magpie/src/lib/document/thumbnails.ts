import type { PDFDocumentProxy } from 'pdfjs-dist';

const REMEMBERED = 240;

export class PageThumbnails {
	#pdf: PDFDocumentProxy;
	#width: number;
	#rendered = new Map<number, ImageBitmap>();
	#queue: Promise<unknown> = Promise.resolve();

	constructor(pdf: PDFDocumentProxy, width: number) {
		this.#pdf = pdf;
		this.#width = width;
	}

	async aspect() {
		const page = await this.#pdf.getPage(1);
		const { width, height } = page.getViewport({ scale: 1 });
		return height / width;
	}

	render(pageNumber: number, wanted: () => boolean): Promise<ImageBitmap | null> {
		const cached = this.#rendered.get(pageNumber);
		if (cached) return Promise.resolve(cached);
		const job = this.#queue.then(async () => {
			if (!wanted()) return null;
			const page = await this.#pdf.getPage(pageNumber);
			const viewport = page.getViewport({ scale: this.#width / page.getViewport({ scale: 1 }).width });
			const canvas = document.createElement('canvas');
			canvas.width = Math.ceil(viewport.width);
			canvas.height = Math.ceil(viewport.height);
			await page.render({ canvas, viewport }).promise;
			const bitmap = await createImageBitmap(canvas);
			this.#remember(pageNumber, bitmap);
			return bitmap;
		});
		this.#queue = job.catch(() => null);
		return job;
	}

	destroy() {
		for (const bitmap of this.#rendered.values()) bitmap.close();
		this.#rendered.clear();
	}

	#remember(pageNumber: number, bitmap: ImageBitmap) {
		this.#rendered.set(pageNumber, bitmap);
		if (this.#rendered.size <= REMEMBERED) return;
		const [oldest, stale] = this.#rendered.entries().next().value!;
		stale.close();
		this.#rendered.delete(oldest);
	}
}
