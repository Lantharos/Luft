<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, Switch } from '@luft/ui';
	import { eraseSelection, fillSelection, invertSelection } from '#lib/document/actions.js';
	import type { Editor } from '../editor.svelte';
	import OptionSlider from './OptionSlider.svelte';

	let { editor }: { editor: Editor } = $props();
	let settings = $derived(editor.settings);
	let doc = $derived(editor.doc);
</script>

{#if settings.tool === 'select'}
	<Segmented
		label={t('easel-option-shape')}
		value={settings.selectShape}
		options={[
			{ value: 'rectangle', label: t('easel-shape-rectangle') },
			{ value: 'ellipse', label: t('easel-shape-ellipse') }
		]}
		onchange={(value) => (settings.selectShape = value)}
	/>
{/if}
<Segmented
	label={t('easel-option-mode')}
	value={settings.selectMode}
	options={[
		{ value: 'new', label: t('easel-select-new') },
		{ value: 'add', label: t('easel-select-add') },
		{ value: 'subtract', label: t('easel-select-subtract') }
	]}
	onchange={(value) => (settings.selectMode = value)}
/>
{#if settings.tool === 'wand'}
	<OptionSlider label={t('easel-option-tolerance')} value={settings.tolerance} min={0} max={1} step={0.01} format={(value) => `${Math.round(value * 100)}%`} onchange={(value) => (settings.tolerance = value)} />
	<div class="flex items-center justify-between px-1 text-[13px]">
		<span>{t('easel-option-contiguous')}</span>
		<Switch label={t('easel-option-contiguous')} checked={settings.contiguous} onchange={(checked) => (settings.contiguous = checked)} />
	</div>
{:else}
	<OptionSlider label={t('easel-option-feather')} value={settings.feather} min={0} max={200} format={(value) => `${value} px`} onchange={(value) => (settings.feather = value)} />
{/if}
<div class="flex flex-wrap gap-1.5">
	<button type="button" class="chip" disabled={!doc.selectionActive} onclick={() => fillSelection(doc, settings.primary)}>{t('easel-selection-fill')}</button>
	<button type="button" class="chip" disabled={!doc.selectionActive} onclick={() => eraseSelection(doc)}>{t('easel-selection-erase')}</button>
	<button type="button" class="chip" onclick={() => invertSelection(doc)}>{t('easel-selection-invert')}</button>
	<button type="button" class="chip" disabled={!doc.selectionActive} onclick={() => doc.clearSelection(t('easel-history-deselect'))}>{t('easel-selection-clear')}</button>
</div>
