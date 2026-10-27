import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { commands, events, type Job, type Operation } from '#lib/bindings.js';

class Operations {
	list = $state<Operation[]>([]);
	#inline = new SvelteMap<number, number>();

	async start() {
		events.schelfOperations((operations) => (this.list = operations));
		this.list = await commands.operationsList();
	}

	forKey(key: string) {
		return this.list.find((operation) => operation.key === key || operation.members.includes(key)) ?? null;
	}

	showInline(id: number) {
		untrack(() => this.#inline.set(id, (this.#inline.get(id) ?? 0) + 1));
		return () =>
			untrack(() => {
				const remaining = (this.#inline.get(id) ?? 1) - 1;
				if (remaining) this.#inline.set(id, remaining);
				else this.#inline.delete(id);
			});
	}

	isInline(id: number) {
		return this.#inline.has(id);
	}

	get running() {
		return this.list.find((operation) => operation.state === 'running') ?? null;
	}

	get pending() {
		return this.list.filter((operation) => operation.state !== 'failed').length;
	}

	run(key: string, title: string, job: Job, members: string[] = []) {
		return commands.operationsStart({ key, title, job, members });
	}

	cancel(id: number) {
		return commands.operationsCancel({ id });
	}
}

export const operations = new Operations();
