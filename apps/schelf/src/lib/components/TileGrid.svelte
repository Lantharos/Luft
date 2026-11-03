<script lang="ts">
	import { catalogKey, type CatalogApp } from '#lib/catalog/types.js';
	import AppTile from './AppTile.svelte';
	import ExtensionTile from './ExtensionTile.svelte';

	let { apps, placeholders = 6 }: { apps: CatalogApp[] | null; placeholders?: number } = $props();

	const extensions = $derived(apps !== null && apps.length > 0 && apps.every((app) => app.kind === 'extension'));
</script>

{#if extensions && apps}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-5 gap-y-6 px-1.5">
		{#each apps as app (catalogKey(app))}
			<ExtensionTile {app} />
		{/each}
	</div>
{:else}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-1">
		{#if apps}
			{#each apps as app (catalogKey(app))}
				<div class="h-[84px]"><AppTile {app} /></div>
			{/each}
		{:else}
			{#each { length: placeholders }, index (index)}
				<div class="skeleton h-[76px]"></div>
			{/each}
		{/if}
	</div>
{/if}
