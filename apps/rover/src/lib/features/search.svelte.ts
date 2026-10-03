import { settings } from '#lib/state/settings.svelte.js';
import * as api from './api';
import type { SearchKind, SearchQuery, SearchResult, SearchUpdate } from './types';

const DEBOUNCE_MS = 140;
const DAY = 86_400;
const MB = 1024 * 1024;
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export type ModifiedFilter = 'any' | 'day' | 'week' | 'month' | 'year';
export type SizeFilter = 'any' | 'small' | 'medium' | 'large';
export type KindFilter = 'any' | SearchKind;

const MODIFIED_SECONDS: Record<Exclude<ModifiedFilter, 'any'>, number> = {
	day: DAY,
	week: 7 * DAY,
	month: 30 * DAY,
	year: 365 * DAY
};

const SIZE_RANGES: Record<Exclude<SizeFilter, 'any'>, [number | null, number | null]> = {
	small: [null, MB],
	medium: [MB, 100 * MB],
	large: [100 * MB, null]
};

class Search {
	open = $state(false);
	root = $state('');
	text = $state('');
	contents = $state(false);
	kind = $state<KindFilter>('any');
	modified = $state<ModifiedFilter>('any');
	size = $state<SizeFilter>('any');
	results = $state.raw<SearchResult[]>([]);
	running = $state(false);
	truncated = $state(false);
	elapsedMs = $state(0);

	ordered = $derived(
		this.results.toSorted(
			(first, second) =>
				Number(first.snippet !== null) - Number(second.snippet !== null) || collator.compare(first.name, second.name)
		)
	);

	#id = 0;
	#runs = 0;
	#starting = false;
	#buffer: SearchUpdate[] = [];
	#timer: ReturnType<typeof setTimeout> | undefined;

	show = (root: string) => {
		if (this.root !== root) this.#reset();
		this.root = root;
		this.open = true;
		if (this.text.trim()) this.schedule();
	};

	close = () => {
		this.open = false;
		this.#cancel();
	};

	schedule = () => {
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => void this.#run(), DEBOUNCE_MS);
	};

	receive = (update: SearchUpdate) => {
		if (update.id === this.#id) return this.#apply(update);
		if (this.#starting && update.id > this.#id) this.#buffer.push(update);
	};

	async #run() {
		this.#cancel();
		this.results = [];
		this.truncated = false;
		if (!this.text.trim()) return;
		const run = ++this.#runs;
		this.running = true;
		this.#starting = true;
		const id = await api.startSearch(this.#query()).catch(() => null);
		if (run !== this.#runs) return;
		this.#starting = false;
		if (id === null) {
			this.running = false;
			return;
		}
		this.#id = id;
		for (const update of this.#buffer.splice(0)) if (update.id === this.#id) this.#apply(update);
	}

	#apply(update: SearchUpdate) {
		if (update.results.length > 0) this.results = [...this.results, ...update.results];
		if (!update.done) return;
		this.running = false;
		this.truncated = update.truncated;
		this.elapsedMs = update.elapsedMs;
	}

	#cancel() {
		clearTimeout(this.#timer);
		this.#runs++;
		this.#starting = false;
		if (this.running) void api.cancelSearch(this.#id);
		this.#id = 0;
		this.#buffer = [];
		this.running = false;
	}

	#reset() {
		this.#cancel();
		this.text = '';
		this.results = [];
		this.truncated = false;
	}

	#query(): SearchQuery {
		const now = Math.floor(Date.now() / 1000);
		const [minSize, maxSize] = this.size === 'any' ? [null, null] : SIZE_RANGES[this.size];
		return {
			root: this.root,
			text: this.text.trim(),
			contents: this.contents,
			kinds: this.kind === 'any' ? [] : [this.kind],
			modifiedAfter: this.modified === 'any' ? null : now - MODIFIED_SECONDS[this.modified],
			minSize,
			maxSize,
			showHidden: settings.value.showHidden
		};
	}
}

export const search = new Search();
