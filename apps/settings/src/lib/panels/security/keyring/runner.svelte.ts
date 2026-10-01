import { problem } from './api';

export class Runner {
	busy = $state(false);
	error = $state('');

	constructor(private readonly refresh: () => Promise<void>) {}

	async run(work: () => Promise<unknown>) {
		this.busy = true;
		this.error = '';
		try {
			await work();
		} catch (reason) {
			this.error = problem(reason);
		}
		await this.refresh();
		this.busy = false;
	}
}
