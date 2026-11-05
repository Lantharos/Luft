<script lang="ts">
	import { t } from '@luft/i18n';
	import { Slider } from '@luft/ui';
	import type { Options } from '#lib/bindings.js';
	import { editor } from '#lib/state/editor.svelte.js';
	import { LOSSY } from '#lib/state/formats.js';
	import Field from './fields/Field.svelte';
	import NumberPair from './fields/NumberPair.svelte';
	import Toggle from './fields/Toggle.svelte';

	interface Props {
		options: Options;
		format: string;
	}

	let { options, format }: Props = $props();

	const lossy = $derived(LOSSY.includes(format));
	const carriesDetails = $derived(['jpeg', 'png', 'webp'].includes(format));
</script>

{#if editor.details?.animated && format !== 'gif'}
	<p class="text-[12px] leading-[1.4] text-[var(--text-muted)]">{t('option-first-frame')}</p>
{/if}
{#if lossy && !options.lossless}
	<Field label={t('option-quality')} value={`${options.quality}`}>
		<Slider label={t('option-quality')} min={10} max={100} step={1} value={options.quality} oninput={(value) => (options.quality = value)} onchange={(value) => (options.quality = value)} />
	</Field>
{/if}
{#if format === 'webp' || format === 'jxl'}
	<Toggle label={t('option-lossless')} checked={options.lossless} onchange={(value) => (options.lossless = value)} />
{/if}
<Field label={t('option-resize')}>
	<NumberPair {options} />
</Field>
{#if carriesDetails}
	<Toggle label={t('option-keep-metadata')} description={t('option-keep-metadata-note')} checked={options.keepMetadata} onchange={(value) => (options.keepMetadata = value)} />
{/if}
