import { fileUrl } from '@lantharos/sabine';
import { createSubscriber, SvelteMap } from 'svelte/reactivity';
import { isDesktopRuntime, localFileSource } from '$lib/runtime';
import type { FileEntry } from '$lib/types';
import { isImage } from '$lib/utils/file-kinds';
import * as api from './api';
import type { ThumbnailBatch, ThumbnailSize } from './types';

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
	#visible = new Map<string, FileEntry>();
	#watchers = new Map<string, () => void>();
	#size: ThumbnailSize = 'normal';
	#requested = '';
	#frame = 0;

	resize(size: ThumbnailSize) {
		if (size === this.#size) return;
		this.#size = size;
		this.#ready.clear();
		this.#schedule();
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
		this.#watch(entry);
		const ready = this.#ready.get(entry.path);
		if (!ready || ready.modified !== entry.modified) return null;
		return ready.url ?? (isImage(entry) ? localFileSource(entry.path, entry.modified) : null);
	}

	#watch(entry: FileEntry) {
		const { path } = entry;
		const visible = this.#visible.get(path);
		if (visible && visible.modified !== entry.modified) {
			this.#visible.set(path, entry);
			this.#schedule();
		}
		let subscribe = this.#watchers.get(path);
		if (!subscribe) {
			subscribe = createSubscriber(() => {
				this.#visible.set(path, entry);
				this.#schedule();
				return () => {
					this.#visible.delete(path);
					this.#watchers.delete(path);
					this.#schedule();
				};
			});
			this.#watchers.set(path, subscribe);
		}
		subscribe();
	}

	#schedule() {
		this.#frame ||= requestAnimationFrame(this.#flush);
	}

	#flush = () => {
		this.#frame = 0;
		const wanted = [...this.#visible.values()]
			.filter((entry) => this.#ready.get(entry.path)?.modified !== entry.modified)
			.map((entry) => entry.path);
		const request = `${this.#size}\n${wanted.join('\n')}`;
		if (request === this.#requested) return;
		this.#requested = request;
		this.#forgetHidden();
		void api.requestThumbnails(wanted, this.#size);
	};

	#forgetHidden() {
		if (this.#ready.size <= REMEMBERED) return;
		for (const path of this.#ready.keys()) if (!this.#visible.has(path)) this.#ready.delete(path);
	}
}

export const thumbnails = new Thumbnails();
