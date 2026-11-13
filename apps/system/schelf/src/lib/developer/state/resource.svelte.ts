import { errorText } from '@luft/ui';
import type { Fetched } from '#lib/bindings.js';

export type Problem = { state: 'offline' } | { state: 'signedOut' } | { state: 'failed'; error: string };

const FRESH_MS = 30_000;

/** Something read from schelf.store, kept while the app runs and read again
 * when it's looked at after a while, or when the window comes back into focus. */
export class Resource<T> {
	data = $state.raw<T | null>(null);
	problem = $state.raw<Problem | null>(null);
	loading = $state(false);

	private readAt = 0;
	private watchers = 0;

	constructor(
		private readonly load: () => Promise<Fetched<T>>,
		private readonly onSignedOut: () => void
	) {}

	async refresh() {
		if (this.loading) return;
		this.loading = true;
		const answer = await this.load().catch((reason): Fetched<T> => ({ state: 'failed', error: errorText(reason) }));
		this.loading = false;
		this.readAt = Date.now();
		if (answer.state === 'ready') {
			this.data = answer.data;
			this.problem = null;
			return;
		}
		this.problem = answer;
		if (answer.state === 'signedOut') this.onSignedOut();
	}

	set(data: T) {
		this.data = data;
		this.problem = null;
		this.readAt = Date.now();
	}

	/** Reads it when it's stale, and keeps it fresh while the caller looks at it. */
	watch() {
		this.watchers++;
		if (Date.now() - this.readAt > FRESH_MS) void this.refresh();
		return () => {
			this.watchers--;
		};
	}

	/** Reads it again now when someone looks at it, and otherwise next time someone does. */
	expire() {
		this.readAt = 0;
		if (this.watchers > 0) void this.refresh();
	}

	get watched() {
		return this.watchers > 0;
	}
}

export class Resources {
	private readonly kept = new Map<string, Resource<unknown>>();

	constructor(private readonly onSignedOut: () => void) {}

	get<T>(key: string, load: () => Promise<Fetched<T>>): Resource<T> {
		let found = this.kept.get(key) as Resource<T> | undefined;
		if (!found) {
			found = new Resource(load, this.onSignedOut);
			this.kept.set(key, found as Resource<unknown>);
		}
		return found;
	}

	refreshWatched() {
		for (const resource of this.kept.values()) if (resource.watched) void resource.refresh();
	}

	expire(prefix: string) {
		for (const [key, resource] of this.kept) if (key.startsWith(prefix)) resource.expire();
	}

	clear() {
		this.kept.clear();
	}
}
