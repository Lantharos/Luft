<script lang="ts">
	import { toolLabel } from '#lib/app/labels.js';
	import { t } from '@luft/i18n';
	import type { Editor } from './editor.svelte';
	import BrushOptions from './options/BrushOptions.svelte';
	import CropOptions from './options/CropOptions.svelte';
	import FloodOptions from './options/FloodOptions.svelte';
	import SelectionOptions from './options/SelectionOptions.svelte';
	import ShapeOptions from './options/ShapeOptions.svelte';
	import TextOptions from './options/TextOptions.svelte';

	let { editor }: { editor: Editor } = $props();
	let settings = $derived(editor.settings);
	let tool = $derived(settings.tool);
</script>

<div class="flex flex-col gap-3.5" role="region" aria-label={t('easel-tool-options')}>
	<h2 class="px-1 text-[14px] font-semibold">{toolLabel[tool]()}</h2>
	{#if tool === 'brush' || tool === 'clone' || tool === 'heal' || tool === 'smudge'}
		<BrushOptions brush={settings.brush} />
		{#if tool === 'clone' || tool === 'heal'}
			<p class="px-1 text-[12.5px] text-(--text-muted)">{t('easel-clone-hint')}</p>
		{/if}
	{:else if tool === 'eraser'}
		<BrushOptions brush={settings.eraser} />
	{:else if tool === 'select' || tool === 'lasso' || tool === 'wand'}
		<SelectionOptions {editor} />
	{:else if tool === 'fill' || tool === 'gradient'}
		<FloodOptions {settings} />
	{:else if tool === 'shapes'}
		<ShapeOptions {settings} />
	{:else if tool === 'text'}
		<TextOptions {settings} />
	{:else if tool === 'crop'}
		<CropOptions {editor} />
	{:else if tool === 'move' && editor.move.active}
		<div class="flex gap-1.5">
			<button type="button" class="chip" onclick={() => editor.move.cancel()}>{t('easel-cancel')}</button>
			<div class="flex-1"></div>
			<button type="button" class="button primary" onclick={() => editor.move.commit()}>{t('easel-apply')}</button>
		</div>
	{/if}
	{#if editor.doc.quickMask}
		<button type="button" class="chip is-on self-start" onclick={() => editor.toggleQuickMask()}>{t('easel-quick-mask-leave')}</button>
	{/if}
</div>
