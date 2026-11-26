<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented } from '@luft/ui';
	import type { QuickEdit } from './quick.svelte';

	let { quick }: { quick: QuickEdit } = $props();
</script>

<Segmented
	label={t('easel-markup-tool')}
	value={quick.markupTool}
	options={[
		{ value: 'pen', label: t('easel-markup-pen') },
		{ value: 'arrow', label: t('easel-shape-arrow') },
		{ value: 'box', label: t('easel-shape-box') },
		{ value: 'text', label: t('easel-tool-text') }
	]}
	onchange={(value) => {
		quick.text.commit();
		quick.markupTool = value;
	}}
/>
<div class="flex gap-2.5" role="radiogroup" aria-label={t('easel-markup-color')}>
	{#each quick.colors as color (color)}
		<button type="button" role="radio" aria-checked={quick.settings.primary === color} aria-label={color} class={['dot', quick.settings.primary === color && 'is-chosen']} style:--dot={color} onclick={() => (quick.settings.primary = color)}></button>
	{/each}
</div>

<style>
	.dot {
		height: 22px;
		width: 22px;
		border-radius: var(--radius-pill);
		background: var(--dot);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
	}

	.dot.is-chosen {
		box-shadow: 0 0 0 2px var(--stage), 0 0 0 4px var(--dot);
	}
</style>
