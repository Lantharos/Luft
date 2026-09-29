import { createSubscriber } from 'svelte/reactivity';
import type { FileEntry } from '$lib/types';

export class OnScreen {
	readonly entries = new Map<string, FileEntry>();
	#watchers = new Map<string, () => void>();
	#frame = 0;
	#flush: () => void;

	constructor(flush: () => void) {
		this.#flush = flush;
	}

	watch(entry: FileEntry) {
		const { path } = entry;
		const shown = this.entries.get(path);
		if (shown && shown.modified !== entry.modified) {
			this.entries.set(path, entry);
			this.schedule();
		}
		let subscribe = this.#watchers.get(path);
		if (!subscribe) {
			subscribe = createSubscriber(() => {
				this.entries.set(path, entry);
				this.schedule();
				return () => {
					this.entries.delete(path);
					this.#watchers.delete(path);
					this.schedule();
				};
			});
			this.#watchers.set(path, subscribe);
		}
		subscribe();
	}

	schedule() {
		this.#frame ||= requestAnimationFrame(this.#run);
	}

	#run = () => {
		this.#frame = 0;
		this.#flush();
	};
}
