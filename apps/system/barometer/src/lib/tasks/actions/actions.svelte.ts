import { activationToken } from '@luft/ui';
import type { Entry, Signal } from '#lib/bindings.js';
import { app } from '#lib/state/app.svelte.js';
import { entries } from '#lib/state/entries.svelte.js';
import { notices } from '#lib/state/notices.svelte.js';
import { processes } from '#lib/state/processes.svelte.js';

const GRACE_MS = 4000;
const STOP_GRACE_MS = 6000;

export type Target = { title: string; pids: number[] } | { title: string; app: string };

export interface Priority {
	target: Target;
	nice: number;
}

class Actions {
	details = $state<number | null>(null);
	priority = $state.raw<Priority | null>(null);
	stuck = $state.raw<Target | null>(null);
	stopping = $state.raw<ReadonlySet<string>>(new Set());

	async signal(target: Target, signal: Signal) {
		if (!app.backend) return false;
		try {
			if ('app' in target) await app.backend.signalApp(target.app, signal);
			else await app.backend.signal(this.#listed(target.pids), signal);
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

	async open(key: string) {
		if (!app.backend) return;
		try {
			await app.backend.openApp(key, await activationToken());
		} catch (error) {
			notices.fail(error);
		}
	}

	async stop(key: string) {
		if (!app.backend) return;
		this.stopping = new Set([...this.stopping, key]);
		try {
			await app.backend.stopApp(key);
		} catch (error) {
			notices.fail(error);
		}
		setTimeout(() => (this.stopping = new Set([...this.stopping].filter((other) => other !== key))), STOP_GRACE_MS);
	}

	async kill(target: Target) {
		this.stuck = null;
		await this.signal(target, 'kill');
	}

	async askPriority(entry: Entry) {
		const main = entry.main === null ? null : await app.backend?.details(entry.main).catch(() => null);
		this.priority = { target: { title: entry.name, app: entry.key }, nice: main?.nice ?? 0 };
	}

	async setPriority(target: Target, nice: number) {
		if (!app.backend) return;
		try {
			if ('app' in target) await app.backend.priorityApp(target.app, nice);
			else await Promise.all(target.pids.map((pid) => app.backend?.priority(pid, nice)));
			this.priority = null;
		} catch (error) {
			notices.fail(error);
		}
	}

	#running(target: Target) {
		return 'app' in target ? entries.find(target.app) !== undefined : target.pids.some((pid) => this.#alive(pid));
	}

	#listed(pids: number[]) {
		return processes.list.filter((process) => pids.includes(process.pid)).map(({ pid, started }) => ({ pid, started }));
	}

	#alive(pid: number) {
		return processes.list.some((process) => process.pid === pid);
	}
}

export const tasks = new Actions();
