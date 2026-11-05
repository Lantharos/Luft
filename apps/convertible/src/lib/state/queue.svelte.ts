import { SvelteMap } from 'svelte/reactivity';
import { commands, events, type ItemUpdate, type NewItem } from '#lib/bindings.js';

class Queue {
	#entries = new SvelteMap<number, ItemUpdate>();
	held = $state(false);

	items = $derived([...this.#entries.values()].reverse());
	active = $derived(this.items.filter((item) => item.state === 'waiting' || item.state === 'running' || item.state === 'paused'));
	finished = $derived(this.items.filter((item) => item.state === 'finished' || item.state === 'failed' || item.state === 'canceled'));
	fraction = $derived.by(() => {
		if (!this.items.length) return 0;
		const done = this.items.reduce((total, item) => total + (item.state === 'finished' ? 1 : item.fraction), 0);
		return done / this.items.length;
	});
	remaining = $derived.by(() => {
		const running = this.active.filter((item) => item.state === 'running' && item.remaining !== null);
		if (!running.length) return null;
		const longest = Math.max(...running.map((item) => item.remaining ?? 0));
		const waiting = this.active.length - running.length;
		return longest * (1 + waiting / Math.max(1, running.length));
	});

	listen() {
		return events.convertibleQueue((update) => this.#entries.set(update.id, update));
	}

	add(items: NewItem[]) {
		return commands.queueAdd({ items });
	}

	hold(held: boolean) {
		this.held = held;
		return commands.queueHold({ held });
	}

	clearFinished() {
		for (const item of this.finished) this.#entries.delete(item.id);
		return commands.queueClear();
	}
}

export const queue = new Queue();
