<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, Switch } from '@luft/ui';
	import type { ToolSettings } from '../settings.svelte';
	import OptionSlider from './OptionSlider.svelte';

	let { settings }: { settings: ToolSettings } = $props();
	let closed = $derived(settings.shape === 'rectangle' || settings.shape === 'ellipse');
</script>

<Segmented
	label={t('easel-option-shape')}
	value={settings.shape}
	options={[
		{ value: 'rectangle', label: t('easel-shape-box') },
		{ value: 'ellipse', label: t('easel-shape-ellipse') },
		{ value: 'line', label: t('easel-shape-line') },
		{ value: 'arrow', label: t('easel-shape-arrow') }
	]}
	onchange={(value) => (settings.shape = value)}
/>
<OptionSlider label={t('easel-option-width')} value={settings.shapeWidth} min={1} max={80} format={(value) => `${value} px`} onchange={(value) => (settings.shapeWidth = value)} />
{#if closed}
	<div class="flex items-center justify-between px-1 text-[13px]">
		<span>{t('easel-option-filled')}</span>
		<Switch label={t('easel-option-filled')} checked={settings.shapeFilled} onchange={(checked) => (settings.shapeFilled = checked)} />
	</div>
{/if}
