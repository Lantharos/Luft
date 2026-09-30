import type { Signal } from '$lib/backend/types';
import { app } from '$lib/state/app.svelte';
import { notices } from '$lib/state/notices.svelte';
import { processes } from '$lib/state/processes.svelte';
import { usage } from '$lib/state/usage.svelte';

const GRACE_MS = 4000;

export type Target = { title: string; pids: number[] } | { title: string; app: string };

class Actions {
	details = $state<number | null>(null);
	priority = $state<{ pid: number; name: string; nice: number } | null>(null);
	stuck = $state<Target | null>(null);

	async signal(target: Target, signal: Signal) {
		if (!app.backend) return false;
		try {
			if ('app' in target) await app.backend.signalApp(target.app, signal);
			else await app.backend.signal(target.pids, signal);
			return true;
		} catch (error) {
			notices.fail(error);
			return false;
		}
	}

	async end(target: Target) {
		if (!(await this.signal(target, 'end'))) return;
		setTimeout(() => {
			if (!this.#running(target)) return;
			this.stuck = 'app' in target ? target : { title: target.title, pids: target.pids.filter((pid) => this.#alive(pid)) };
		}, GRACE_MS);
	}

	async kill(target: Target) {
		this.stuck = null;
		await this.signal(target, 'kill');
	}

	async setPriority(pid: number, nice: number) {
		if (!app.backend) return;
		try {
			await app.backend.priority(pid, nice);
			this.priority = null;
		} catch (error) {
			notices.fail(error);
		}
	}

	#running(target: Target) {
		return 'app' in target ? usage.apps.some((candidate) => candidate.key === target.app) : target.pids.some((pid) => this.#alive(pid));
	}

	#alive(pid: number) {
		return processes.list.some((process) => process.pid === pid);
	}
}

export const tasks = new Actions();
