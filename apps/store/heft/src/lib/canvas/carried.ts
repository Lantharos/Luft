import type { Carried, CarryZone } from '#lib/drag/carry.svelte.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { addPicture, addQuote } from '#lib/objects/editing.svelte.js';
import type { PageStore } from '#lib/page/storage.js';
import { copied } from '#lib/selection/selection.svelte.js';
import { pageNear } from './layout';
import type { Viewport } from './viewport.svelte';

async function png(canvas: HTMLCanvasElement) {
	const blob = await new Promise<Blob>((resolve) => canvas.toBlob((made) => resolve(made!), 'image/png'));
	return new Uint8Array(await blob.arrayBuffer());
}

/** A pane that takes what's carried over from the other one, at the page under where it's let go. */
export function carryZone(element: HTMLElement, viewport: Viewport, notebook: OpenNotebook, stores: Map<string, PageStore>): CarryZone {
	return {
		element,
		take(item: Carried, clientX: number, clientY: number) {
			const rect = element.getBoundingClientRect();
			const [x, y] = viewport.toContent(clientX - rect.left, clientY - rect.top);
			const index = pageNear(viewport.layout, y);
			const page = viewport.layout.pages[index];
			const store = stores.get(notebook.meta.pages[index]?.id);
			if (!page || !store) return;
			const document = store.document;
			const [pageX, pageY] = [x - page.left, y - page.top];
			if (item.kind === 'text') {
				addQuote(document, page.width, item.text, { x: Math.max(8, pageX - 20), y: pageY });
				return;
			}
			const width = item.bounds.right - item.bounds.left;
			const left = Math.min(Math.max(0, pageX - item.grab[0]), Math.max(0, page.width - width));
			const top = Math.max(0, pageY - item.grab[1]);
			if (item.picture) {
				void item.picture().then(async (picture) => addPicture(document, notebook.folder, page, await png(picture), 'clipping.png', { x: left, y: top, width }));
				return;
			}
			document.commit({ removed: [], added: copied(item.strokes, left - item.bounds.left, top - item.bounds.top, document.lastOrder) });
		}
	};
}
