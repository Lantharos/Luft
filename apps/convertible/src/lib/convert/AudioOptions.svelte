<script lang="ts">
	import { t } from '@luft/i18n';
	import { Select } from '@luft/ui';
	import type { Options } from '#lib/bindings.js';
	import { LOSSY_AUDIO } from '#lib/state/formats.js';
	import Field from './fields/Field.svelte';
	import Toggle from './fields/Toggle.svelte';

	interface Props {
		options: Options;
		format: string;
		advanced: boolean;
	}

	let { options, format, advanced }: Props = $props();

	const BITRATES = [96, 128, 160, 192, 256, 320];
	const SAMPLE_RATES = [22050, 44100, 48000, 96000];

	const bitrates = $derived([{ value: 0, label: t('option-automatic') }, ...BITRATES.map((value) => ({ value, label: t('option-kilobits', { value }) }))]);
	const sampleRates = $derived([{ value: 0, label: t('option-keep-rate') }, ...SAMPLE_RATES.map((value) => ({ value, label: t('option-hertz', { value: value / 1000 }) }))]);
	const channels = $derived([
		{ value: 0, label: t('option-keep-channels') },
		{ value: 1, label: t('option-mono') },
		{ value: 2, label: t('option-stereo') }
	]);
</script>

{#if LOSSY_AUDIO.includes(format) && format !== 'ogg'}
	<Field label={t('option-bitrate')}>
		<Select label={t('option-bitrate')} options={bitrates} value={options.audioBitrate ?? 0} onchange={(value) => (options.audioBitrate = value || null)} />
	</Field>
{/if}
<Toggle label={t('option-keep-tags')} checked={options.keepMetadata} onchange={(value) => (options.keepMetadata = value)} />
{#if advanced}
	<Field label={t('option-sample-rate')}>
		<Select label={t('option-sample-rate')} options={sampleRates} value={options.sampleRate ?? 0} onchange={(value) => (options.sampleRate = value || null)} />
	</Field>
	<Field label={t('option-channels')}>
		<Select label={t('option-channels')} options={channels} value={options.channels ?? 0} onchange={(value) => (options.channels = value || null)} />
	</Field>
{/if}
