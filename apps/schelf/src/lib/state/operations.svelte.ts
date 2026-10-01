import type { Job, Operation } from '$lib/bridge/types';
import { backend } from './backend';

class Operations {
	list = $state<Operation[]>([]);

	async start() {
		backend().onOperations((operations) => (this.list = operations));
		this.list = await backend().operations();
	}

	forKey(key: string) {
		return this.list.find((operation) => operation.key === key || operation.members.includes(key)) ?? null;
	}

	get running() {
		return this.list.find((operation) => operation.state === 'running') ?? null;
	}

	get pending() {
		return this.list.filter((operation) => operation.state !== 'failed').length;
	}

	run(key: string, title: string, job: Job, members: string[] = []) {
		return backend().start(key, title, job, members);
	}

	cancel(id: number) {
		return backend().cancel(id);
	}
}

export const operations = new Operations();
