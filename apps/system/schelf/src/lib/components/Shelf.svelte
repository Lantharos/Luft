<script lang="ts">
	import { t } from '@luft/i18n';
	import type { CatalogApp } from '#lib/bindings.js';
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
			<button type="button" class="plain-button" onclick={onmore}>{t('shelf-see-all')}</button>
		{/if}
	</div>
	<TileGrid {apps} />
</section>
