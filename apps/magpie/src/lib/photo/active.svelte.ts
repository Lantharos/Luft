import type { Item } from '#lib/api.js';
import type { Viewport } from './render/viewport.svelte';
import type { PhotoSource } from './source';

class ActivePhoto {
	item = $state.raw<Item | null>(null);
	viewport = $state.raw<Viewport | null>(null);
	source = $state.raw<PhotoSource | null>(null);

	show(item: Item, viewport: Viewport, source: PhotoSource) {
		this.item = item;
		this.viewport = viewport;
		this.source = source;
	}

	clear(viewport: Viewport) {
		if (this.viewport !== viewport) return;
		this.item = null;
		this.viewport = null;
		this.source = null;
	}
}

export const activePhoto = new ActivePhoto();
