import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import * as api from '#lib/api/index.js';
import type { Message, Rendered } from '#lib/api/index.js';

const CACHE_LIMIT = 80;

class Reader {
	thread = $state<number | null>(null);
	messages = $state.raw<Message[]>([]);
	expanded = new SvelteSet<number>();
	bodies = new SvelteMap<number, Rendered>();
	failures = new SvelteMap<number, string>();

	subject = $derived(this.messages.at(-1)?.subject || this.messages[0]?.subject || '');
	latest = $derived(this.messages.findLast((message) => !message.draft) ?? this.messages.at(-1) ?? null);

	private loading = new Map<number, Promise<Rendered | null>>();
	private waiting = new Map<number, (error: string | null) => void>();
	private generation = 0;

	async open(thread: number | null) {
		const generation = ++this.generation;
		this.thread = thread;
		if (thread === null) {
			this.messages = [];
			return;
		}
		const messages = await api.conversation(thread);
		if (generation !== this.generation) return;
		this.expanded.clear();
		const unread = messages.filter((message) => !message.seen);
		const shown = unread.length ? unread : messages.slice(-1);
		for (const message of shown) this.expanded.add(message.id);
		this.messages = messages;
		await Promise.all(shown.map((message) => this.body(message.id)));
	}

	async refresh() {
		if (this.thread === null) return;
		const messages = await api.conversation(this.thread);
		if (!messages.length) return this.open(null);
		this.messages = messages;
	}

	close() {
		void this.open(null);
	}

	toggle(id: number) {
		if (this.expanded.has(id)) {
			this.expanded.delete(id);
			return;
		}
		this.expanded.add(id);
		void this.body(id);
	}

	expandAll() {
		for (const message of this.messages) {
			this.expanded.add(message.id);
			void this.body(message.id);
		}
	}

	body(id: number): Promise<Rendered | null> {
		const cached = this.bodies.get(id);
		if (cached) return Promise.resolve(cached);
		const pending = this.loading.get(id);
		if (pending) return pending;
		this.failures.delete(id);
		const request = this.fetch(id)
			.then((rendered) => {
				if (this.bodies.size >= CACHE_LIMIT) this.bodies.delete(this.bodies.keys().next().value!);
				this.bodies.set(id, rendered);
				return rendered;
			})
			.catch((error: unknown) => {
				this.failures.set(id, error instanceof Error ? error.message : String(error));
				return null;
			})
			.finally(() => this.loading.delete(id));
		this.loading.set(id, request);
		return request;
	}

	private async fetch(id: number): Promise<Rendered> {
		const arrived = new Promise<string | null>((resolve) => this.waiting.set(id, resolve));
		const rendered = await api.messageBody(id);
		if (rendered) {
			this.waiting.delete(id);
			return rendered;
		}
		const error = await arrived;
		if (error) throw new Error(error);
		const fetched = await api.messageBody(id);
		if (!fetched) throw new Error('This message is still on its way');
		return fetched;
	}

	receive = ({ id, error }: { id: number; error: string | null }) => {
		this.waiting.get(id)?.(error);
		this.waiting.delete(id);
	};
}

export const reader = new Reader();
