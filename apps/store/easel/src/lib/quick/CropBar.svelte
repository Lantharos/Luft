<script lang="ts">
	import FlipHorizontal from '@luft/symbols/icons/flip-horizontal-2';
	import RotateCw from '@luft/symbols/icons/rotate-cw';
	import { t } from '@luft/i18n';
	import { Segmented, Slider, tooltip } from '@luft/ui';
	import type { QuickEdit } from './quick.svelte';

	let { quick }: { quick: QuickEdit } = $props();
	let chosen = $state('free');
	let doc = $derived(quick.doc);
	let ratios = $derived([
		{ value: 'free', label: t('easel-ratio-free'), ratio: null },
		{ value: 'original', label: t('easel-ratio-original'), ratio: doc.width / doc.height },
		{ value: 'square', label: t('easel-ratio-square'), ratio: 1 },
		{ value: 'wide', label: '16:9', ratio: 16 / 9 },
		{ value: 'photo', label: '4:3', ratio: 4 / 3 },
		{ value: 'tall', label: '9:16', ratio: 9 / 16 }
	]);
</script>

<Segmented
	label={t('easel-option-ratio')}
	value={chosen}
	options={ratios}
	onchange={(value) => {
		chosen = value;
		quick.crop.setRatio(ratios.find((ratio) => ratio.value === value)!.ratio);
	}}
/>
<div class="flex w-[260px] items-center gap-3">
	<span class="text-[13px] text-(--text-soft)">{t('easel-straighten')}</span>
	<div class="flex-1"><Slider label={t('easel-straighten')} value={quick.angle} min={-45} max={45} step={0.5} oninput={(value) => quick.straighten(value)} onchange={(value) => quick.straighten(value)} /></div>
	<span class="w-9 text-[12.5px] text-(--text-muted) tabular-nums">{quick.angle}°</span>
</div>
<button type="button" class="icon-button" aria-label={t('easel-rotate')} onclick={() => quick.turn()} {@attach tooltip(t('easel-rotate'))}><RotateCw size={18} /></button>
<button type="button" class="icon-button" aria-label={t('easel-flip')} onclick={() => quick.flip()} {@attach tooltip(t('easel-flip'))}><FlipHorizontal size={18} /></button>
