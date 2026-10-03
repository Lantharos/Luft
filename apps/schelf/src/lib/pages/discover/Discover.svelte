<script lang="ts">
	import Shelf from '#lib/components/Shelf.svelte';
	import * as fedora from '#lib/catalog/fedora.js';
	import * as flathub from '#lib/catalog/flathub.js';
	import type { AppDetails, CatalogApp } from '#lib/catalog/types.js';
	import { backend } from '#lib/state/backend.js';
	import { catalog } from '#lib/state/catalog.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import Spotlight from './Spotlight.svelte';

	const SHELF_SIZE = 6;

	let popular = $state<CatalogApp[] | null>(null);
	let trending = $state<CatalogApp[] | null>(null);
	let updated = $state<CatalogApp[] | null>(null);
	let spotlight = $state<AppDetails | null>(null);
	let offline = $state(false);

	const fedoraApps = $derived(catalog.fedora.length ? fedora.featured(catalog.fedora, SHELF_SIZE) : null);

	async function shelf(name: flathub.Collection) {
		return (await flathub.collection(backend(), name, 1, SHELF_SIZE + 1)).apps;
	}

	async function load() {
		offline = false;
		try {
			const [first, second, third] = await Promise.all([shelf('trending'), shelf('popular'), shelf('recently-updated')]);
			trending = first.slice(1, SHELF_SIZE + 1);
			popular = second.slice(0, SHELF_SIZE);
			updated = third.slice(0, SHELF_SIZE);
			if (first[0]) spotlight = await flathub.details(backend(), first[0].id).catch(() => null);
		} catch {
			offline = true;
		}
	}

	void load();
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[1040px] flex-col gap-8 px-8 pt-2 pb-10">
		{#if offline}
			<div class="flex items-center justify-between gap-4 rounded-[var(--radius-group)] bg-[var(--surface)] px-5 py-4">
				<p class="text-[14px] text-[var(--text-soft)]">Flathub can't be reached right now. Apps from Fedora and the ones you have are still here.</p>
				<button type="button" class="button" onclick={load}>Try again</button>
			</div>
		{:else}
			{#if spotlight}
				<Spotlight app={spotlight} />
			{:else}
				<div class="skeleton h-[240px]"></div>
			{/if}
			<Shelf title="Trending" apps={trending} onmore={() => navigation.push({ page: 'collection', collection: 'trending' })} />
			<Shelf title="Popular" apps={popular} onmore={() => navigation.push({ page: 'collection', collection: 'popular' })} />
			<Shelf title="New and updated" apps={updated} onmore={() => navigation.push({ page: 'collection', collection: 'recently-updated' })} />
		{/if}
		<Shelf title="From Fedora" apps={fedoraApps} />
	</div>
</div>
