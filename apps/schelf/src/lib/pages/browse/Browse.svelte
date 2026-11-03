<script lang="ts">
	import { VirtualScroller } from '@luft/ui';
	import type { CatalogApp } from '#lib/bindings.js';
	import AppTile from '#lib/components/AppTile.svelte';
	import * as store from '#lib/catalog/store.js';
	import { catalogKey } from '#lib/catalog/types.js';
	import { catalog } from '#lib/state/catalog.svelte.js';
	import type { Route } from '#lib/state/navigation.svelte.js';

	type Listing = Extract<Route, { page: 'category' } | { page: 'collection' } | { page: 'extensions' }>;

	const LAYOUT = { itemHeight: 84, minItemWidth: 250, gap: 4, padding: { top: 4, left: 28, right: 28, bottom: 40 } };

	let { route }: { route: Listing } = $props();

	let apps = $state.raw<CatalogApp[]>([]);
	let loaded = $state(false);
	let error = $state<string | null>(null);

	function fetchApps(): Promise<CatalogApp[]> {
		if (route.page === 'category') return store.category(route.category);
		if (route.page === 'collection') return store.collection(route.collection);
		return store.extensions();
	}

	async function load() {
		const current = route;
		try {
			const result = await fetchApps();
			if (current !== route) return;
			apps = result;
			error = null;
		} catch (reason) {
			error = String(reason);
		} finally {
			loaded = true;
		}
	}

	$effect(() => {
		void route;
		void catalog.version;
		void load();
	});
</script>

<VirtualScroller class="soft-scroll h-full" items={apps} key={catalogKey} layout={LAYOUT}>
	{#snippet header()}
		<div class="flex min-h-2 items-center justify-between gap-4 bg-[var(--content)] px-8 pb-3">
			{#if error}
				<span class="text-[13px] text-[var(--text-muted)]">{error}</span>
				<button type="button" class="button" onclick={() => catalog.refresh()}>Try again</button>
			{:else if route.page === 'extensions'}
				<p class="px-1.5 text-[14px] text-[var(--text-soft)]">
					{loaded && !apps.length ? 'There are no extensions yet.' : 'Extensions add to your desktop, from the wallpaper to quick settings and the taskbar.'}
				</p>
			{/if}
		</div>
	{/snippet}
	{#snippet children(app)}
		<AppTile {app} />
	{/snippet}
</VirtualScroller>
