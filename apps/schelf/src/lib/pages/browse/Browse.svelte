<script lang="ts">
	import { VirtualScroller } from '@luft/ui';
	import AppTile from '#lib/components/AppTile.svelte';
	import * as flathub from '#lib/catalog/flathub.js';
	import type { CatalogApp, Page } from '#lib/catalog/types.js';
	import type { Route } from '#lib/state/navigation.svelte.js';

	type Listing = Extract<Route, { page: 'category' } | { page: 'collection' }>;

	const PRELOAD_PX = 800;
	const LAYOUT = { itemHeight: 84, minItemWidth: 250, gap: 4, padding: { top: 4, left: 28, right: 28, bottom: 40 } };

	let { route }: { route: Listing } = $props();

	let apps = $state.raw<CatalogApp[]>([]);
	let error = $state<string | null>(null);
	let loading = false;
	let page = 0;
	let pages = 1;

	function fetchPage(next: number): Promise<Page> {
		return route.page === 'category' ? flathub.category(route.category, next) : flathub.collection(route.collection, next);
	}

	async function more() {
		if (loading || page >= pages) return;
		loading = true;
		const current = route;
		try {
			const result = await fetchPage(page + 1);
			if (current !== route) return;
			page += 1;
			pages = result.pages;
			const known = new Set(apps.map((app) => app.key));
			apps = [...apps, ...result.apps.filter((app) => !known.has(app.key))];
			error = null;
		} catch (reason) {
			error = String(reason);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void route;
		apps = [];
		page = 0;
		pages = 1;
		loading = false;
		void more();
	});

	function scrolled(event: UIEvent & { currentTarget: HTMLDivElement }) {
		const scroller = event.currentTarget;
		if (scroller.scrollTop + scroller.clientHeight > scroller.scrollHeight - PRELOAD_PX) void more();
	}
</script>

<VirtualScroller class="soft-scroll h-full" items={apps} key={(app) => app.key} layout={LAYOUT} onscroll={scrolled}>
	{#snippet header()}
		<div class="flex min-h-2 items-center justify-between gap-4 bg-[var(--content)] px-8 pb-3">
			{#if error}
				<span class="text-[13px] text-[var(--text-muted)]">{error}</span>
				<button type="button" class="button" onclick={more}>Try again</button>
			{/if}
		</div>
	{/snippet}
	{#snippet children(app)}
		<AppTile {app} />
	{/snippet}
</VirtualScroller>
