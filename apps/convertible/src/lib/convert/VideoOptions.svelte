<script lang="ts">
	import { t } from '@luft/i18n';
	import { Select, Slider } from '@luft/ui';
	import type { Options } from '#lib/bindings.js';
	import { capabilities } from '#lib/state/capabilities.svelte.js';
	import { CODEC_NAMES, CONTAINER_CODECS } from '#lib/state/formats.js';
	import Field from './fields/Field.svelte';
	import Toggle from './fields/Toggle.svelte';

	interface Props {
		options: Options;
		format: string;
		advanced: boolean;
	}

	let { options, format, advanced }: Props = $props();

	const HEIGHTS = [2160, 1440, 1080, 720, 480, 360];
	const RATES = [60, 30, 24, 15];

	const gif = $derived(format === 'gif');
	const codecs = $derived(capabilities.codecs(CONTAINER_CODECS[format] ?? []));
	const codecChoices = $derived([{ value: '', label: t('option-automatic') }, ...codecs.map((id) => ({ value: id, label: CODEC_NAMES[id] }))]);
	const sizes = $derived([{ value: 0, label: t('option-keep-size') }, ...HEIGHTS.map((value) => ({ value, label: `${value}p` }))]);
	const rates = $derived([{ value: 0, label: t('option-keep-rate') }, ...RATES.map((value) => ({ value, label: t('option-rate', { rate: value }) }))]);
	const hardware = $derived(capabilities.hardware(options.videoCodec));
</script>

{#if gif}
	<Field label={t('option-gif-note')}>
		<Select label={t('option-size')} options={sizes} value={options.height ?? 0} onchange={(value) => (options.height = value || null)} />
	</Field>
{:else}
	<Field label={t('option-quality')} value={`${options.quality}`}>
		<Slider label={t('option-quality')} min={10} max={100} step={1} value={options.quality} oninput={(value) => (options.quality = value)} onchange={(value) => (options.quality = value)} />
	</Field>
	<Field label={t('option-size')}>
		<Select label={t('option-size')} options={sizes} value={options.height ?? 0} onchange={(value) => (options.height = value || null)} />
	</Field>
{/if}
<Field label={t('option-frame-rate')}>
	<Select label={t('option-frame-rate')} options={rates} value={options.frameRate ?? 0} onchange={(value) => (options.frameRate = value || null)} />
</Field>
{#if advanced && !gif}
	<Field label={t('option-codec')}>
		<Select label={t('option-codec')} options={codecChoices} value={options.videoCodec ?? ''} onchange={(value) => (options.videoCodec = value || null)} />
	</Field>
	{#if hardware}
		<Toggle label={t('option-hardware')} description={t('option-hardware-note')} checked={options.hardware} onchange={(value) => (options.hardware = value)} />
	{/if}
	<Toggle label={t('option-copy')} description={t('option-copy-note')} checked={options.copyStreams} onchange={(value) => (options.copyStreams = value)} />
	<Toggle label={t('option-keep-sound')} checked={options.audio === 'keep'} onchange={(value) => (options.audio = value ? 'keep' : 'remove')} />
	<Toggle label={t('option-keep-metadata')} checked={options.keepMetadata} onchange={(value) => (options.keepMetadata = value)} />
{/if}
