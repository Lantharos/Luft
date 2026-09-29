import { fileUrl } from '@lantharos/sabine';
import { SvelteMap } from 'svelte/reactivity';
import { isDesktopRuntime, localFileSource } from '$lib/runtime';
import type { FileEntry } from '$lib/types';
import { isImage } from '$lib/utils/file-kinds';
import * as api from '../api';
import { OnScreen } from './tracker';
import type { ThumbnailBatch, ThumbnailSize } from '../types';

const SIZES: [number, ThumbnailSize][] = [
	[128, 'normal'],
	[256, 'large'],
	[512, 'x-large']
];
const REMEMBERED = 4000;

interface Ready {
	modified: number | null;
	url: string | null;
}

export function thumbnailSize(pixels: number): ThumbnailSize {
	return SIZES.find(([limit]) => pixels <= limit)?.[1] ?? 'xx-large';
}

class Thumbnails {
	#ready = new SvelteMap<string, Ready>();
	#screen = new OnScreen(() => this.#flush());
	#size: ThumbnailSize = 'normal';
	#requested = '';

	resize(size: ThumbnailSize) {
		if (size === this.#size) return;
		this.#size = size;
		this.#ready.clear();
		this.#screen.schedule();
	}

	receive = (batch: ThumbnailBatch) => {
		for (const item of batch.items) {
			this.#ready.set(item.path, {
				modified: item.modified,
				url: item.thumbnail && `${fileUrl(item.thumbnail)}?v=${item.modified}`
			});
		}
	};

	source(entry: FileEntry) {
		if (!entry.is_file) return null;
		if (!isDesktopRuntime()) return isImage(entry) ? localFileSource(entry.path, entry.modified) : null;
		this.#screen.watch(entry);
		const ready = this.#ready.get(entry.path);
		if (!ready || ready.modified !== entry.modified) return null;
		return ready.url ?? (isImage(entry) ? localFileSource(entry.path, entry.modified) : null);
	}

	#flush() {
		const wanted = [...this.#screen.entries.values()]
			.filter((entry) => this.#ready.get(entry.path)?.modified !== entry.modified)
			.map((entry) => entry.path);
		const request = `${this.#size}\n${wanted.join('\n')}`;
		if (request === this.#requested) return;
		this.#requested = request;
		this.#forgetHidden();
		void api.requestThumbnails(wanted, this.#size);
	}

	#forgetHidden() {
		if (this.#ready.size <= REMEMBERED) return;
		for (const path of this.#ready.keys()) if (!this.#screen.entries.has(path)) this.#ready.delete(path);
	}
}

export const thumbnails = new Thumbnails();
