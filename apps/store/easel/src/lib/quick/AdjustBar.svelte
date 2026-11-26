<script lang="ts">
	import { adjustLabel } from '#lib/app/labels.js';
	import Sparkles from '@luft/symbols/icons/sparkles';
	import { t } from '@luft/i18n';
	import { Slider } from '@luft/ui';
	import type { Adjust } from '#lib/gpu/shaders/adjust.js';
	import { NEUTRAL } from '#lib/gpu/shaders/adjust.js';
	import { autoAdjust } from './auto';
	import type { QuickEdit } from './quick.svelte';

	let { quick }: { quick: QuickEdit } = $props();

	const SLIDERS: { key: keyof Adjust; min: number; max: number }[] = [
		{ key: 'exposure', min: -1, max: 1 },
		{ key: 'contrast', min: -0.6, max: 0.6 },
		{ key: 'saturation', min: -1, max: 1 },
		{ key: 'warmth', min: -1, max: 1 },
		{ key: 'sharpen', min: 0, max: 1 }
	];

	const set = (key: keyof Adjust, value: number) => quick.setAdjust({ ...quick.adjust, [key]: value });
</script>

<button type="button" class="chip" onclick={async () => quick.setAdjust(await autoAdjust(quick.doc))}><Sparkles size={15} />{t('easel-adjust-auto')}</button>
{#each SLIDERS as slider (slider.key)}
	<div class="flex w-[150px] flex-col gap-1.5">
		<span class="text-[12.5px] text-(--text-soft)">{adjustLabel[slider.key]()}</span>
		<Slider label={adjustLabel[slider.key]()} value={quick.adjust[slider.key]} min={slider.min} max={slider.max} step={0.01} oninput={(value) => set(slider.key, value)} onchange={(value) => set(slider.key, value)} />
	</div>
{/each}
<button type="button" class="chip" onclick={() => quick.setAdjust({ ...NEUTRAL })}>{t('easel-adjust-reset')}</button>
