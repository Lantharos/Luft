<script lang="ts">
	import { t } from '@luft/i18n';
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
	<button type="button" class="icon-button" aria-label={t('magpie-zoom-out')} disabled={viewport.scale <= viewport.minScale + 0.001} onclick={() => viewport.zoomOut()} {@attach tooltip(t('magpie-zoom-out'))}>
		<Minus size={16} />
	</button>
	<button type="button" class="level" aria-label={t('magpie-zoom-actual-size')} onclick={() => viewport.actualSize()} {@attach tooltip(viewport.zoomed ? t('magpie-zoom-fit') : t('magpie-zoom-actual-size'))}>
		{t('magpie-zoom-percent', { percent })}
	</button>
	<button type="button" class="icon-button" aria-label={t('magpie-zoom-in')} onclick={() => viewport.zoomIn()} {@attach tooltip(t('magpie-zoom-in'))}>
		<Plus size={16} />
	</button>
	<button
		type="button"
		class="icon-button"
		aria-label={viewport.fitted ? t('magpie-zoom-actual-size') : t('magpie-zoom-fit')}
		onclick={() => (viewport.fitted ? viewport.actualSize() : viewport.fit())}
		{@attach tooltip(viewport.fitted ? t('magpie-zoom-actual-size') : t('magpie-zoom-fit'))}
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
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.level:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
