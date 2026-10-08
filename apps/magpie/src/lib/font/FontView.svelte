<script lang="ts">
	import { Segmented } from '@luft/ui';
	import type { Item } from '#lib/bridge/api.js';
	import FontDetails from './FontDetails.svelte';
	import GlyphGrid from './GlyphGrid.svelte';
	import SamplePane from './SamplePane.svelte';
	import { fontState, type Tab } from './state.svelte';

	let { item }: { item: Item } = $props();

	const TABS: { value: Tab; label: string }[] = [
		{ value: 'preview', label: 'Preview' },
		{ value: 'characters', label: 'Characters' },
		{ value: 'details', label: 'Details' }
	];

	$effect(() => {
		void fontState.open(item.path);
	});
</script>

<div class="flex h-full min-h-0 flex-col">
	{#if fontState.problem}
		<div class="grid flex-1 place-items-center p-8 text-center">
			<div class="flex max-w-[420px] flex-col gap-2">
				<h2 class="text-[18px] font-semibold">{item.name} can't be shown</h2>
				<p class="text-[13px] text-[var(--text-muted)]">{fontState.problem}</p>
			</div>
		</div>
	{:else if fontState.face}
		<div class="flex flex-none justify-center pb-2">
			<div class="w-[340px]">
				<Segmented label="View" options={TABS} value={fontState.tab} onchange={(tab) => (fontState.tab = tab)} />
			</div>
		</div>
		{#if fontState.tab === 'preview'}
			<SamplePane />
		{:else if fontState.tab === 'characters'}
			<GlyphGrid />
		{:else}
			<FontDetails {item} />
		{/if}
	{/if}
</div>
