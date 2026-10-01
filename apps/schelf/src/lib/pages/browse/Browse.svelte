<script lang="ts">
	import { Segmented, VirtualScroller } from '@luft/ui';
	import AppTile from '$lib/components/AppTile.svelte';
	import { category } from '$lib/catalog/categories';
	import * as fedora from '$lib/catalog/fedora';
	import * as flathub from '$lib/catalog/flathub';
	import type { CatalogApp, Origin, Page } from '$lib/catalog/types';
	import { backend } from '$lib/state/backend';
	import { catalog } from '$lib/state/catalog.svelte';
	import type { Route } from '$lib/state/navigation.svelte';

	type Listing = Extract<Route, { page: 'category' } | { page: 'collection' }>;

	const PRELOAD_PX = 800;
	const LAYOUT = { itemHeight: 84, minItemWidth: 250, gap: 4, padding: { top: 4, left: 28, right: 28, bottom: 40 } };

	let { route }: { route: Listing } = $props();

	let source = $state<Origin>('flathub');
	let apps = $state.raw<CatalogApp[]>([]);
	let error = $state<string | null>(null);
	let loading = false;
	let page = 0;
	let pages = 1;

	const fedoraApps = $derived(route.page === 'category' ? fedora.inCategory(catalog.fedora, category(route.category)) : []);
	const shown = $derived(source === 'flathub' ? apps : fedoraApps);

	function fetchPage(next: number): Promise<Page> {
		return route.page === 'category' ? flathub.category(backend(), route.category, next) : flathub.collection(backend(), route.collection, next);
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
		source = 'flathub';
		loading = false;
		void more();
	});

	function scrolled(event: UIEvent & { currentTarget: HTMLDivElement }) {
		const scroller = event.currentTarget;
		if (source === 'flathub' && scroller.scrollTop + scroller.clientHeight > scroller.scrollHeight - PRELOAD_PX) void more();
	}
</script>

<VirtualScroller class="soft-scroll h-full" items={shown} key={(app) => app.key} layout={LAYOUT} onscroll={scrolled}>
	{#snippet header()}
		<div class="flex min-h-2 items-center justify-between gap-4 bg-[var(--content)] px-8 pb-3">
			{#if route.page === 'category'}
				<Segmented
					label="Source"
					value={source}
					options={[
						{ value: 'flathub', label: 'Flathub' },
						{ value: 'fedora', label: `Fedora` }
					]}
					onchange={(value) => (source = value)}
				/>
			{/if}
			{#if error && source === 'flathub'}
				<span class="text-[13px] text-[var(--text-muted)]">{error}</span>
				<button type="button" class="button" onclick={more}>Try again</button>
			{:else if source === 'fedora' && !fedoraApps.length}
				<span class="text-[13px] text-[var(--text-muted)]">Fedora has no apps in this category.</span>
			{/if}
		</div>
	{/snippet}
	{#snippet children(app)}
		<AppTile {app} />
	{/snippet}
</VirtualScroller>
