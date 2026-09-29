<script lang="ts">
	import { tooltip } from '@luft/ui';
	import Expand from '@lucide/svelte/icons/expand';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import Shrink from '@lucide/svelte/icons/shrink';
	import type { Viewport } from './render/viewport.svelte';

	let { viewport }: { viewport: Viewport } = $props();

	let percent = $derived(Math.round(viewport.scale * 100));
</script>

<div class="floating-bar" data-no-drag>
	<button type="button" class="icon-button" aria-label="Zoom out" disabled={viewport.scale <= viewport.minScale + 0.001} onclick={() => viewport.zoomOut()} {@attach tooltip('Zoom out')}>
		<Minus size={16} />
	</button>
	<button type="button" class="level" aria-label="Actual size" onclick={() => viewport.actualSize()} {@attach tooltip(viewport.zoomed ? 'Fit to window' : 'Actual size')}>
		{percent}%
	</button>
	<button type="button" class="icon-button" aria-label="Zoom in" onclick={() => viewport.zoomIn()} {@attach tooltip('Zoom in')}>
		<Plus size={16} />
	</button>
	<button
		type="button"
		class="icon-button"
		aria-label={viewport.fitted ? 'Actual size' : 'Fit to window'}
		onclick={() => (viewport.fitted ? viewport.actualSize() : viewport.fit())}
		{@attach tooltip(viewport.fitted ? 'Actual size' : 'Fit to window')}
	>
		{#if viewport.fitted}<Expand size={15} />{:else}<Shrink size={15} />{/if}
	</button>
</div>

<style>
	.level {
		min-width: 52px;
		height: 32px;
		border-radius: var(--radius-pill);
		font-size: 12px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--text-soft);
		transition: background-color 160ms var(--ease);
	}

	.level:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
