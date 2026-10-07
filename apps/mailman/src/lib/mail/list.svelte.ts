import { SvelteSet } from 'svelte/reactivity';
import * as api from '#lib/api/index.js';
import type { ThreadRow } from '#lib/api/index.js';
import { mail } from './mail.svelte';
import { BUNDLES } from './views';

const PAGE = 150;
const MAX_RELOAD = 1500;

export interface Summary {
	view: string;
	label: string;
	count: number;
	names: string[];
}

export type Item = { kind: 'thread'; row: ThreadRow } | { kind: 'summary'; summary: Summary };

function names(rows: ThreadRow[]) {
	return [...new Set(rows.map((row) => row.senderName || row.sender))].slice(0, 3);
}

class ThreadList {
	view = $state('inbox');
	query = $state('');
	rows = $state.raw<ThreadRow[]>([]);
	total = $state(0);
	selected = $state<number | null>(null);
	loading = $state(false);
	summaries = $state.raw<Summary[]>([]);
	chosen = new SvelteSet<number>();
	private anchor: number | null = null;

	items = $derived<Item[]>([
		...this.summaries.map((summary) => ({ kind: 'summary' as const, summary })),
		...this.rows.map((row) => ({ kind: 'thread' as const, row }))
	]);
	index = $derived(this.rows.findIndex((row) => row.thread === this.selected));
	current = $derived(this.index >= 0 ? this.rows[this.index] : null);
	searching = $derived(this.query.trim().length > 0);

	private generation = 0;
	private fetchingMore = false;
	private exhausted = false;

	async open(view: string) {
		this.chosen.clear();
		this.view = view;
		this.query = '';
		this.selected = null;
		this.rows = [];
		await this.load();
	}

	async search(query: string) {
		this.chosen.clear();
		this.query = query;
		this.selected = null;
		await this.load();
	}

	load = async () => {
		if (this.view === 'screener' && !mail.settings.screener) this.view = 'inbox';
		const generation = ++this.generation;
		this.loading = true;
		const limit = Math.min(MAX_RELOAD, Math.max(PAGE, this.rows.length));
		const [page, summaries] = await Promise.all([api.threads(this.view, this.query || null, null, limit), this.loadSummaries()]);
		if (generation !== this.generation) return;
		const last = page.rows.at(-1);
		const fresh = new Set(page.rows.map((row) => row.thread));
		const deeper = page.rows.length === limit && last ? this.rows.filter((row) => !fresh.has(row.thread) && (row.date < last.date || (row.date === last.date && row.thread < last.thread))) : [];
		this.rows = [...page.rows, ...deeper];
		this.total = page.total ?? 0;
		this.exhausted = page.rows.length < limit;
		this.summaries = summaries;
		this.loading = false;
	};

	async more() {
		const last = this.rows.at(-1);
		if (this.fetchingMore || this.exhausted || !last) return;
		this.fetchingMore = true;
		const generation = this.generation;
		const page = await api.threads(this.view, this.query || null, { date: last.date, thread: last.thread }, PAGE).finally(() => (this.fetchingMore = false));
		if (generation !== this.generation) return;
		const known = new Set(this.rows.map((row) => row.thread));
		this.rows = [...this.rows, ...page.rows.filter((row) => !known.has(row.thread))];
		this.exhausted = page.rows.length < PAGE;
	}

	private async loadSummaries(): Promise<Summary[]> {
		if (this.view !== 'inbox' || this.query) return [];
		const summaries: Summary[] = [];
		const counts = mail.counts;
		if (mail.settings.screener && counts.screener > 0) {
			const page = await api.threads('screener', null, null, 4);
			summaries.push({ view: 'screener', label: 'New senders', count: counts.screener, names: names(page.rows) });
		}
		if (!mail.settings.bundles) return summaries;
		for (const bundle of BUNDLES) {
			const count = bundle.count?.(counts) ?? 0;
			if (!count) continue;
			const page = await api.threads(bundle.id, null, null, 6);
			summaries.push({ view: bundle.id, label: bundle.label, count, names: names(page.rows.filter((row) => row.unread > 0)) });
		}
		return summaries;
	}

	select(thread: number | null) {
		this.selected = thread;
	}

	choose(thread: number, range = false) {
		const anchor = this.anchor === null ? -1 : this.rows.findIndex((row) => row.thread === this.anchor);
		const index = this.rows.findIndex((row) => row.thread === thread);
		if (range && anchor >= 0 && index >= 0) {
			for (const row of this.rows.slice(Math.min(anchor, index), Math.max(anchor, index) + 1)) this.chosen.add(row.thread);
		} else if (this.chosen.has(thread)) {
			this.chosen.delete(thread);
		} else {
			this.chosen.add(thread);
		}
		this.anchor = thread;
	}

	targets() {
		if (this.chosen.size) return [...this.chosen];
		return this.selected === null ? [] : [this.selected];
	}

	step(offset: number) {
		if (!this.rows.length) return null;
		const index = this.index < 0 ? (offset > 0 ? 0 : this.rows.length - 1) : Math.min(this.rows.length - 1, Math.max(0, this.index + offset));
		this.selected = this.rows[index].thread;
		if (index > this.rows.length - 20) void this.more();
		return this.rows[index];
	}

	remove(threads: number[]) {
		const gone = new Set(threads);
		for (const thread of threads) this.chosen.delete(thread);
		const index = this.index;
		const remaining = this.rows.filter((row) => !gone.has(row.thread));
		if (this.selected !== null && gone.has(this.selected)) {
			const next = this.rows.slice(index + 1).find((row) => !gone.has(row.thread)) ?? remaining[remaining.length - 1];
			this.selected = next?.thread ?? null;
		}
		this.total -= this.rows.length - remaining.length;
		this.rows = remaining;
	}

	update(thread: number, change: Partial<ThreadRow>) {
		this.rows = this.rows.map((row) => (row.thread === thread ? { ...row, ...change } : row));
	}
}

export const list = new ThreadList();
