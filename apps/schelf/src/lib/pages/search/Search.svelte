<script lang="ts">
	import AppArt from '#lib/components/AppArt.svelte';
	import Shelf from '#lib/components/Shelf.svelte';
	import * as fedora from '#lib/catalog/fedora.js';
	import * as flathub from '#lib/catalog/flathub.js';
	import type { CatalogApp } from '#lib/catalog/types.js';
	import { sourceName } from '#lib/format.js';
	import { backend } from '#lib/state/backend.js';
	import { catalog } from '#lib/state/catalog.svelte.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';

	const LIMIT = 30;

	let { query }: { query: string } = $props();

	let remote = $state<CatalogApp[] | null>(null);
	let error = $state<string | null>(null);

	const needle = $derived(query.toLowerCase());
	const installed = $derived(library.installed.filter((app) => app.name.toLowerCase().includes(needle)).slice(0, 8));
	const local = $derived(catalog.fedora.length ? fedora.search(catalog.fedora, query).slice(0, LIMIT) : null);

	$effect(() => {
		const current = query;
		remote = null;
		error = null;
		flathub
			.search(backend(), current)
			.then((apps) => {
				if (current === query) remote = apps.slice(0, LIMIT);
			})
			.catch((reason) => {
				if (current === query) error = String(reason);
			});
	});

	const nothing = $derived(!installed.length && remote?.length === 0 && local?.length === 0);
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[1040px] flex-col gap-8 px-8 pt-2 pb-10">
		{#if installed.length}
			<section class="flex flex-col gap-2">
				<h2 class="px-1.5 text-[17px] font-semibold">On this computer</h2>
				<div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-1">
					{#each installed as app (app.key)}
						<button type="button" class="result" onclick={() => navigation.push({ page: 'app', target: { installed: app.key }, name: app.name })}>
							<AppArt icon={app.icon} desktop={app.desktop} size={40} />
							<span class="flex min-w-0 flex-col">
								<span class="truncate text-[14px] font-semibold">{app.name}</span>
								<span class="truncate text-[12.5px] text-[var(--text-muted)]">{sourceName(app.source, app.origin)}</span>
							</span>
						</button>
					{/each}
				</div>
			</section>
		{/if}
		{#if error}
			<p class="px-1.5 text-[14px] text-[var(--text-muted)]">Flathub can't be searched right now. {error}</p>
		{:else if remote === null || remote.length}
			<Shelf title="Flathub" apps={remote} />
		{/if}
		{#if local === null || local.length}
			<Shelf title="Fedora" apps={local} />
		{/if}
		{#if nothing}
			<p class="px-1.5 pt-10 text-center text-[15px] text-[var(--text-muted)]">Nothing matches “{query}”.</p>
		{/if}
	</div>
</div>

<style>
	.result {
		display: flex;
		align-items: center;
		gap: 12px;
		border-radius: var(--radius-group);
		padding: 10px 14px;
		text-align: left;
		transition: background-color 160ms var(--ease);
	}

	.result:hover {
		background: var(--surface-hover);
	}
</style>
