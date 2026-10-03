<script lang="ts">
	import type { CatalogApp } from '#lib/catalog/types.js';
	import TileGrid from './TileGrid.svelte';

	interface Props {
		title: string;
		apps: CatalogApp[] | null;
		onmore?: () => void;
	}

	let { title, apps, onmore }: Props = $props();
</script>

<section class="flex flex-col gap-2">
	<div class="flex items-center justify-between px-1.5">
		<h2 class="text-[17px] font-semibold">{title}</h2>
		{#if onmore}
			<button type="button" class="plain-button" onclick={onmore}>See all</button>
		{/if}
	</div>
	<TileGrid {apps} />
</section>
