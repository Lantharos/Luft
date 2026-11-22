<script lang="ts">
	import { t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import type { CatalogApp, Collection } from '#lib/bindings.js';
	import Shelf from '#lib/components/Shelf.svelte';
	import * as store from '#lib/catalog/store.js';
	import { catalogKey, type AppDetails } from '#lib/catalog/types.js';
	import { details } from '#lib/pages/app/load.js';
	import { catalog } from '#lib/state/catalog.svelte.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { collectionTitle } from '#lib/state/titles.js';
	import Spotlight from './Spotlight.svelte';

	const SHELF_SIZE = 6;
	const SPOTLIGHT = 1;
	const SHELVES: Collection[] = ['popular', 'updated'];

	let collections = $state<Record<Collection, CatalogApp[]> | null>(null);
	let spotlight = $state<{ listing: CatalogApp; app: AppDetails } | null>(null);
	let offline = $state(false);

	const featured = $derived.by(() => {
		if (!collections || !library.loaded) return null;
		const fresh = collections.popular.filter((app) => !library.forListing(app));
		return fresh.find((app) => app.origin === 'schelf') ?? fresh[0] ?? null;
	});
	const empty = $derived(collections !== null && !collections.popular.length);
	const shelves = $derived.by(() => {
		if (!collections || !library.loaded) return null;
		const others = (apps: CatalogApp[]) => apps.filter((app) => !featured || catalogKey(app) !== catalogKey(featured)).slice(0, SHELF_SIZE);
		return { popular: others(collections.popular), updated: others(collections.updated) };
	});

	async function load(installed: number) {
		offline = false;
		try {
			const [popular, updated] = await Promise.all([
				store.collection('popular', installed + SPOTLIGHT + SHELF_SIZE),
				store.collection('updated', SPOTLIGHT + SHELF_SIZE)
			]);
			collections = { popular, updated };
		} catch {
			offline = true;
		}
	}

	$effect(() => {
		void catalog.version;
		if (library.loaded) void load(library.installed.length);
	});

	const featuredKey = $derived(featured && catalogKey(featured));

	$effect(() => {
		const key = featuredKey;
		const listing = untrack(() => featured);
		spotlight = null;
		if (!listing) return;
		void details(listing)
			.then((app) => {
				if (featuredKey === key) spotlight = { listing, app };
			})
			.catch(() => {});
	});
</script>

<div class="h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[1040px] flex-col gap-8 px-8 pt-2 pb-10">
		{#if offline}
			<div class="flex items-center justify-between gap-4 rounded-[var(--radius-group)] bg-[var(--surface)] px-5 py-4">
				<p class="text-[14px] text-[var(--text-soft)]">
					{t('discover-offline')}
				</p>
				<button type="button" class="button" onclick={() => catalog.refresh()}>{t('discover-try-again')}</button>
			</div>
		{:else if empty}
			<p class="px-1.5 pt-16 text-center text-[15px] text-[var(--text-muted)]">{t('discover-empty')}</p>
		{:else}
			{#if spotlight}
				<Spotlight listing={spotlight.listing} app={spotlight.app} />
			{:else if !collections || featured}
				<div class="skeleton h-[240px]"></div>
			{/if}
			{#each SHELVES as collection (collection)}
				<Shelf title={collectionTitle(collection)} apps={shelves?.[collection] ?? null} onmore={() => navigation.push({ page: 'collection', collection })} />
			{/each}
		{/if}
	</div>
</div>
