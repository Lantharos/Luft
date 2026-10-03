<script lang="ts">
	import type { CatalogApp } from '#lib/catalog/types.js';
	import AppTile from './AppTile.svelte';

	let { apps, placeholders = 6 }: { apps: CatalogApp[] | null; placeholders?: number } = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-1">
	{#if apps}
		{#each apps as app (app.key)}
			<div class="h-[84px]"><AppTile {app} /></div>
		{/each}
	{:else}
		{#each { length: placeholders }, index (index)}
			<div class="skeleton h-[76px]"></div>
		{/each}
	{/if}
</div>
