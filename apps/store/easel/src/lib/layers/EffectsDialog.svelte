<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Slider, Switch } from '@luft/ui';
	import { untrack } from 'svelte';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import { layerState, NO_EFFECTS, type Effects, type Layer } from '#lib/document/layers.svelte.js';
	import { StateChange } from '#lib/document/entries.js';

	let { doc, layer, onclose }: { doc: ImageDocument; layer: Layer; onclose: () => void } = $props();

	const COLORS = ['#000000', '#ffffff', '#e5484d', '#f2c94c', '#2f6fde', '#4caf7a'];
	const before = untrack(() => layerState(layer));
	untrack(() => (layer.effects ??= structuredClone(NO_EFFECTS)));
	let effects = $derived(layer.effects!);

	function changed() {
		doc.invalidate();
	}

	function finish(keep: boolean) {
		if (keep) doc.record(new StateChange(t('easel-history-effects'), layer, before, layerState(layer), () => doc.invalidate()));
		else {
			layer.effects = before.effects && structuredClone(before.effects);
			doc.invalidate();
		}
		onclose();
	}

	type Section = keyof Effects;
</script>

{#snippet slider(label: string, value: number, min: number, max: number, step: number, set: (value: number) => void)}
	<div class="flex flex-col gap-2">
		<div class="flex justify-between text-[13px]"><span>{label}</span><span class="text-(--text-muted) tabular-nums">{Math.round(value * 100) / 100}</span></div>
		<Slider {label} {value} {min} {max} {step} oninput={(next) => (set(next), changed())} onchange={(next) => (set(next), changed())} />
	</div>
{/snippet}

{#snippet colors(section: Section)}
	<div class="flex gap-2" role="radiogroup" aria-label={t('easel-effect-color')}>
		{#each COLORS as color (color)}
			<button type="button" role="radio" aria-checked={effects[section].color === color} aria-label={color} class={['swatch', effects[section].color === color && 'is-chosen']} style:--swatch={color} onclick={() => ((effects[section].color = color), changed())}></button>
		{/each}
	</div>
{/snippet}

<Dialog title={t('easel-effects')} onclose={() => finish(false)}>
	<div class="flex flex-col gap-5 px-2.5 py-2.5">
		<div class="flex items-center justify-between text-[14px] font-semibold">
			<span>{t('easel-effect-shadow')}</span>
			<Switch label={t('easel-effect-shadow')} checked={effects.shadow.enabled} onchange={(checked) => ((effects.shadow.enabled = checked), changed())} />
		</div>
		{#if effects.shadow.enabled}
			{@render slider(t('easel-effect-x'), effects.shadow.x, -100, 100, 1, (value) => (effects.shadow.x = value))}
			{@render slider(t('easel-effect-y'), effects.shadow.y, -100, 100, 1, (value) => (effects.shadow.y = value))}
			{@render slider(t('easel-effect-blur'), effects.shadow.blur, 0, 100, 1, (value) => (effects.shadow.blur = value))}
			{@render slider(t('easel-option-opacity'), effects.shadow.opacity, 0, 1, 0.01, (value) => (effects.shadow.opacity = value))}
			{@render colors('shadow')}
		{/if}
		<div class="flex items-center justify-between text-[14px] font-semibold">
			<span>{t('easel-effect-stroke')}</span>
			<Switch label={t('easel-effect-stroke')} checked={effects.stroke.enabled} onchange={(checked) => ((effects.stroke.enabled = checked), changed())} />
		</div>
		{#if effects.stroke.enabled}
			{@render slider(t('easel-option-size'), effects.stroke.size, 1, 60, 1, (value) => (effects.stroke.size = value))}
			{@render slider(t('easel-option-opacity'), effects.stroke.opacity, 0, 1, 0.01, (value) => (effects.stroke.opacity = value))}
			{@render colors('stroke')}
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={() => finish(false)}>{t('easel-cancel')}</button>
		<button type="button" class="button primary" onclick={() => finish(true)}>{t('easel-done')}</button>
	{/snippet}
</Dialog>

<style>
	.swatch {
		height: 24px;
		width: 24px;
		border-radius: var(--radius-pill);
		background: var(--swatch);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}

	.swatch.is-chosen {
		box-shadow: 0 0 0 2px var(--popover), 0 0 0 4px var(--swatch);
	}
</style>
