<script lang="ts">
	import { t } from '@luft/i18n';
	import { Switch } from '@luft/ui';
	import type { BrushSettings } from '#lib/gpu/brush.js';
	import OptionSlider from './OptionSlider.svelte';

	let { brush }: { brush: BrushSettings } = $props();
	const percent = (value: number) => `${Math.round(value * 100)}%`;
</script>

<OptionSlider label={t('easel-option-size')} value={brush.size} min={1} max={500} format={(value) => `${value} px`} onchange={(value) => (brush.size = value)} />
<OptionSlider label={t('easel-option-hardness')} value={brush.hardness} min={0} max={1} step={0.01} format={percent} onchange={(value) => (brush.hardness = value)} />
<OptionSlider label={t('easel-option-opacity')} value={brush.opacity} min={0.01} max={1} step={0.01} format={percent} onchange={(value) => (brush.opacity = value)} />
<OptionSlider label={t('easel-option-smoothing')} value={brush.smoothing} min={0} max={1} step={0.01} format={percent} onchange={(value) => (brush.smoothing = value)} />
<div class="flex items-center justify-between px-1 text-[13px]">
	<span>{t('easel-option-pressure')}</span>
	<Switch label={t('easel-option-pressure')} checked={brush.pressureSize} onchange={(checked) => (brush.pressureSize = checked)} />
</div>
