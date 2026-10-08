import { createSubscriber } from 'svelte/reactivity';
import type { Item } from '#lib/bridge/api.js';

export class OnScreen {
	readonly items = new Map<string, Item>();
	#watchers = new Map<string, () => void>();
	#frame = 0;
	#flush: () => void;

	constructor(flush: () => void) {
		this.#flush = flush;
	}

	watch(item: Item) {
		const { path } = item;
		const shown = this.items.get(path);
		if (shown && shown.modified !== item.modified) {
			this.items.set(path, item);
			this.schedule();
		}
		let subscribe = this.#watchers.get(path);
		if (!subscribe) {
			subscribe = createSubscriber(() => {
				this.items.set(path, item);
				this.schedule();
				return () => {
					this.items.delete(path);
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
