<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, Select } from '@luft/ui';
	import type { ToolSettings } from '../settings.svelte';
	import OptionSlider from './OptionSlider.svelte';

	let { settings }: { settings: ToolSettings } = $props();

	const FONTS = ['Open Runde', 'Maple Mono NF', 'serif', 'sans-serif'];
</script>

<Select
	label={t('easel-option-font')}
	value={settings.font}
	options={FONTS.map((font) => ({ value: font, label: font === 'serif' ? t('easel-font-serif') : font === 'sans-serif' ? t('easel-font-sans') : font }))}
	onchange={(value) => (settings.font = value)}
/>
<OptionSlider label={t('easel-option-size')} value={settings.fontSize} min={6} max={400} format={(value) => t('easel-pixels', { value })} onchange={(value) => (settings.fontSize = value)} />
<Segmented
	label={t('easel-option-weight')}
	value={settings.fontWeight}
	options={[
		{ value: 400, label: t('easel-weight-regular') },
		{ value: 600, label: t('easel-weight-bold') }
	]}
	onchange={(value) => (settings.fontWeight = value)}
/>
