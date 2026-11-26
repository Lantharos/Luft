<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Segmented, Slider } from '@luft/ui';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import { refineSelection, selectColorRange, type Refinement } from '#lib/raster/selection/refine.js';
	import type { SelectMode } from '#lib/raster/selection/selection.js';

	interface Props {
		doc: ImageDocument;
		kind: 'refine' | 'range';
		color: string;
		mode: SelectMode;
		onclose: () => void;
	}

	let { doc, kind, color, mode, onclose }: Props = $props();
	let how = $state<Refinement>('grow');
	let radius = $state(8);
	let tolerance = $state(0.15);
</script>

<Dialog title={kind === 'refine' ? t('easel-refine') : t('easel-color-range')} {onclose}>
	<div class="flex flex-col gap-4 px-2.5 py-2.5">
		{#if kind === 'refine'}
			<Segmented
				label={t('easel-refine')}
				value={how}
				options={[
					{ value: 'grow', label: t('easel-refine-grow') },
					{ value: 'shrink', label: t('easel-refine-shrink') },
					{ value: 'border', label: t('easel-refine-border') },
					{ value: 'smooth', label: t('easel-refine-smooth') }
				]}
				onchange={(value) => (how = value)}
			/>
			<div class="flex justify-between text-[13px]"><span>{t('easel-filter-radius')}</span><span class="text-(--text-muted) tabular-nums">{t('easel-pixels', { value: radius })}</span></div>
			<Slider label={t('easel-filter-radius')} value={radius} min={1} max={100} step={1} oninput={(value) => (radius = value)} onchange={(value) => (radius = value)} />
		{:else}
			<div class="flex items-center gap-3 text-[13px]"><span class="size-7 rounded-full" style:background={color}></span>{t('easel-color-range-hint')}</div>
			<div class="flex justify-between text-[13px]"><span>{t('easel-option-tolerance')}</span><span class="text-(--text-muted) tabular-nums">{Math.round(tolerance * 100)}%</span></div>
			<Slider label={t('easel-option-tolerance')} value={tolerance} min={0} max={1} step={0.01} oninput={(value) => (tolerance = value)} onchange={(value) => (tolerance = value)} />
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={onclose}>{t('easel-cancel')}</button>
		<button
			type="button"
			class="button primary"
			onclick={async () => {
				if (kind === 'refine') refineSelection(doc, how, radius);
				else await selectColorRange(doc, color, tolerance, mode);
				onclose();
			}}>{t('easel-apply')}</button
		>
	{/snippet}
</Dialog>
