<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Segmented, Slider } from '@luft/ui';
	import { untrack } from 'svelte';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import { layerState, type Layer } from '#lib/document/layers.svelte.js';
	import { StateChange } from '#lib/document/entries.js';
	import CurveEditor from './CurveEditor.svelte';
	import { adjustmentName, fieldsFor, type Tone } from './fields';

	let { doc, layer, onclose }: { doc: ImageDocument; layer: Layer; onclose: () => void } = $props();

	const before = untrack(() => layerState(layer));
	let tone = $state<Tone>('midtones');
	let adjustment = $derived(layer.adjustment!);
	let fields = $derived(fieldsFor(adjustment.type, tone));

	function changed() {
		doc.invalidate();
	}

	function finish(keep: boolean) {
		if (keep) doc.record(new StateChange(t('easel-history-adjustment'), layer, before, layerState(layer), () => doc.invalidate()));
		else {
			layer.adjustment = before.adjustment && structuredClone(before.adjustment);
			doc.invalidate();
		}
		onclose();
	}
</script>

<Dialog title={adjustmentName[adjustment.type]()} onclose={() => finish(false)}>
	<div class="flex flex-col gap-4 px-2.5 py-3">
		{#if adjustment.type === 'curves'}
			<CurveEditor
				points={adjustment.curve}
				onchange={(points) => {
					adjustment.curve = points;
					changed();
				}}
			/>
		{/if}
		{#if adjustment.type === 'balance'}
			<Segmented
				label={t('easel-balance-tone')}
				value={tone}
				options={[
					{ value: 'shadows', label: t('easel-balance-shadows') },
					{ value: 'midtones', label: t('easel-balance-midtones') },
					{ value: 'highlights', label: t('easel-balance-highlights') }
				]}
				onchange={(value) => (tone = value)}
			/>
		{/if}
		{#each fields as entry (entry.label())}
			<div class="flex flex-col gap-2">
				<div class="flex justify-between text-[13px]"><span>{entry.label()}</span><span class="text-(--text-muted) tabular-nums">{entry.get(adjustment).toFixed(2)}</span></div>
				<Slider
					label={entry.label()}
					value={entry.get(adjustment)}
					min={entry.min}
					max={entry.max}
					step={entry.step}
					oninput={(value) => (entry.set(adjustment, value), changed())}
					onchange={(value) => (entry.set(adjustment, value), changed())}
				/>
			</div>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={() => finish(false)}>{t('easel-cancel')}</button>
		<button type="button" class="button primary" onclick={() => finish(true)}>{t('easel-done')}</button>
	{/snippet}
</Dialog>
