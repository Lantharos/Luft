import { SvelteMap } from 'svelte/reactivity';
import type { Item, ThumbnailBatch } from '#lib/bridge/api.js';
import * as api from '#lib/bridge/api.js';
import { fileSource, isDesktop } from '#lib/bridge/index.js';
import { OnScreen } from './onscreen';

const SIZE = 'large';
const REMEMBERED = 2000;

interface Ready {
	modified: number;
	url: string | null;
}

function current(ready: Ready, item: Item) {
	return ready.modified === Math.floor(item.modified / 1000);
}

class Thumbnails {
	#ready = new SvelteMap<string, Ready>();
	#screen = new OnScreen(() => this.#flush());
	#requested = '';

	receive = (batch: ThumbnailBatch) => {
		for (const item of batch.items) {
			this.#ready.set(item.path, { modified: item.modified, url: item.thumbnail && fileSource(item.thumbnail, item.modified) });
		}
	};

	source(item: Item) {
		if (!isDesktop()) return item.kind === 'image' ? fileSource(item.path, item.modified) : null;
		this.#screen.watch(item);
		const ready = this.#ready.get(item.path);
		return ready && current(ready, item) ? ready.url : null;
	}

	peek(item: Item) {
		return this.#ready.get(item.path)?.url ?? null;
	}

	#flush() {
		const wanted = [...this.#screen.items.values()]
			.filter((item) => {
				const ready = this.#ready.get(item.path);
				return !ready || !current(ready, item);
			})
			.map((item) => item.path);
		const request = wanted.join('\n');
		if (request === this.#requested) return;
		this.#requested = request;
		this.#forgetHidden();
		void api.requestThumbnails(wanted, SIZE);
	}

	#forgetHidden() {
		if (this.#ready.size <= REMEMBERED) return;
		for (const path of this.#ready.keys()) if (!this.#screen.items.has(path)) this.#ready.delete(path);
	}
}

export const thumbnails = new Thumbnails();
