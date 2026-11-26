<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, Switch } from '@luft/ui';
	import type { ToolSettings } from '../settings.svelte';
	import OptionSlider from './OptionSlider.svelte';

	let { settings }: { settings: ToolSettings } = $props();
</script>

{#if settings.tool === 'gradient'}
	<Segmented
		label={t('easel-option-kind')}
		value={settings.gradient}
		options={[
			{ value: 'linear', label: t('easel-gradient-linear') },
			{ value: 'radial', label: t('easel-gradient-radial') }
		]}
		onchange={(value) => (settings.gradient = value)}
	/>
{:else}
	<OptionSlider label={t('easel-option-tolerance')} value={settings.tolerance} min={0} max={1} step={0.01} format={(value) => `${Math.round(value * 100)}%`} onchange={(value) => (settings.tolerance = value)} />
	<div class="flex items-center justify-between px-1 text-[13px]">
		<span>{t('easel-option-contiguous')}</span>
		<Switch label={t('easel-option-contiguous')} checked={settings.contiguous} onchange={(checked) => (settings.contiguous = checked)} />
	</div>
{/if}
