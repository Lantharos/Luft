import * as api from '$lib/api';
import type { ThreadRow } from '$lib/api';
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

	items = $derived<Item[]>([
		...this.summaries.map((summary) => ({ kind: 'summary' as const, summary })),
		...this.rows.map((row) => ({ kind: 'thread' as const, row }))
	]);
	index = $derived(this.rows.findIndex((row) => row.thread === this.selected));
	current = $derived(this.index >= 0 ? this.rows[this.index] : null);
	searching = $derived(this.query.trim().length > 0);

	private generation = 0;
	private fetchingMore = false;

	async open(view: string) {
		this.view = view;
		this.query = '';
		this.selected = null;
		this.rows = [];
		await this.load();
	}

	async search(query: string) {
		this.query = query;
		this.selected = null;
		await this.load();
	}

	load = async () => {
		const generation = ++this.generation;
		this.loading = true;
		const limit = Math.min(MAX_RELOAD, Math.max(PAGE, this.rows.length));
		const [page, summaries] = await Promise.all([api.threads(this.view, this.query || null, 0, limit), this.loadSummaries()]);
		if (generation !== this.generation) return;
		this.rows = page.rows;
		this.total = page.total;
		this.summaries = summaries;
		this.loading = false;
	};

	async more() {
		if (this.fetchingMore || this.rows.length >= this.total) return;
		this.fetchingMore = true;
		const generation = this.generation;
		const page = await api.threads(this.view, this.query || null, this.rows.length, PAGE).finally(() => (this.fetchingMore = false));
		if (generation !== this.generation) return;
		const known = new Set(this.rows.map((row) => row.thread));
		this.rows = [...this.rows, ...page.rows.filter((row) => !known.has(row.thread))];
		this.total = page.total;
	}

	private async loadSummaries(): Promise<Summary[]> {
		if (this.view !== 'inbox' || this.query) return [];
		const summaries: Summary[] = [];
		const counts = mail.counts;
		if (mail.settings.screener && counts.screener > 0) {
			const page = await api.threads('screener', null, 0, 4);
			summaries.push({ view: 'screener', label: 'New senders', count: counts.screener, names: names(page.rows) });
		}
		if (!mail.settings.bundles) return summaries;
		for (const bundle of BUNDLES) {
			const count = bundle.count?.(counts) ?? 0;
			if (!count) continue;
			const page = await api.threads(bundle.id, null, 0, 6);
			summaries.push({ view: bundle.id, label: bundle.label, count, names: names(page.rows.filter((row) => row.unread > 0)) });
		}
		return summaries;
	}

	select(thread: number | null) {
		this.selected = thread;
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
