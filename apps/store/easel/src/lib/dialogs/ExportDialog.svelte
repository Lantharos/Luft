<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Segmented, Slider } from '@luft/ui';
	import type { Format } from '#lib/bindings.js';
	import { LOSSY, type ExportChoice } from '#lib/files/export.js';

	interface Props {
		size: (area: string) => { width: number; height: number };
		areas: { value: string; label: string }[];
		vector?: boolean;
		run: (choice: ExportChoice) => Promise<boolean>;
		onclose: () => void;
	}

	let { size, areas, vector = false, run, onclose }: Props = $props();

	const NAMES: Record<string, string> = { png: 'PNG', jpeg: 'JPEG', webp: 'WebP', avif: 'AVIF' };

	let format = $state<ExportChoice['format']>('png');
	let quality = $state(90);
	let scale = $state(1);
	let area = $state(untrack(() => areas.at(-1)?.value ?? ''));
	let busy = $state(false);
	let error = $state('');

	let { width, height } = $derived(size(area));
	let raster = $derived(format !== 'svg' && format !== 'pdf');
	let lossy = $derived(raster && LOSSY.has(format as Format));
	let formats = $derived([...(['png', 'jpeg', 'webp', 'avif'] as const).map((value) => ({ value, label: NAMES[value] })), ...(vector ? (['svg', 'pdf'] as const).map((value) => ({ value, label: value.toUpperCase() })) : [])]);

	async function start() {
		busy = true;
		error = '';
		try {
			if (await run({ format, quality, scale, area })) onclose();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}
</script>

<Dialog title={t('easel-export-title')} wide {onclose}>
	<div class="flex flex-col gap-5 px-2.5 py-3">
		{#if areas.length}
			<Segmented label={t('easel-export-area')} value={area} options={areas} onchange={(value) => (area = value)} />
		{/if}
		<Segmented label={t('easel-export-format')} value={format} options={formats} onchange={(value) => (format = value)} />
		{#if raster}
			<div class="flex flex-col gap-2">
				<div class="flex justify-between text-[13px]"><span>{t('easel-export-size')}</span><span class="text-(--text-muted) tabular-nums">{Math.max(1, Math.round(width * scale))} × {Math.max(1, Math.round(height * scale))}</span></div>
				<Slider label={t('easel-export-size')} value={scale} min={0.1} max={vector ? 4 : 1} step={0.05} onchange={(value) => (scale = value)} oninput={(value) => (scale = value)} />
			</div>
		{/if}
		{#if lossy}
			<div class="flex flex-col gap-2">
				<div class="flex justify-between text-[13px]"><span>{t('easel-export-quality')}</span><span class="text-(--text-muted) tabular-nums">{quality}</span></div>
				<Slider label={t('easel-export-quality')} value={quality} min={10} max={100} step={1} onchange={(value) => (quality = value)} oninput={(value) => (quality = value)} />
			</div>
		{/if}
		{#if error}<p class="text-[13px] text-(--danger)">{error}</p>{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={onclose}>{t('easel-cancel')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={start}>{t('easel-export-save')}</button>
	{/snippet}
</Dialog>
