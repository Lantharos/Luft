<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { t } from '@luft/i18n';
	import { Select } from '@luft/ui';
	import type { Family, FileEntry } from '#lib/bindings.js';
	import { ARCHIVE, AUDIO, LOSSY_AUDIO, VIDEO } from '#lib/state/formats.js';
	import { session } from '#lib/state/session.svelte.js';
	import AudioOptions from './AudioOptions.svelte';
	import DocumentOptions from './DocumentOptions.svelte';
	import Field from './fields/Field.svelte';
	import ImageOptions from './ImageOptions.svelte';
	import SizeField from './fields/SizeField.svelte';
	import VideoOptions from './VideoOptions.svelte';

	interface Props {
		family: Family;
		file: FileEntry;
	}

	let { family, file }: Props = $props();

	let advanced = $state(false);

	const format = $derived(session.choices[family] ?? '');
	const options = $derived(session.optionsFor(family));
	const video = $derived(VIDEO.includes(format) || (format === 'gif' && family === 'video'));
	const audio = $derived(AUDIO.includes(format));
	const picture = $derived(family === 'image' && !video && format !== 'pdf');
	const archive = $derived(ARCHIVE.includes(format));
	const shrinkable = $derived(picture || (video && format !== 'gif') || LOSSY_AUDIO.includes(format));
	const expandable = $derived((video && format !== 'gif') || audio || picture);
	const levels = $derived([
		{ value: 1, label: t('option-level-fast') },
		{ value: 6, label: t('option-level-balanced') },
		{ value: 9, label: t('option-level-small') }
	]);
</script>

{#if format}
	<div class="flex flex-col gap-3">
		{#if picture}
			<ImageOptions {options} {format} />
		{:else if video}
			<VideoOptions {options} {format} {advanced} />
		{:else if audio}
			<AudioOptions {options} {format} {advanced} />
		{:else if archive}
			<Field label={t('option-compression')}>
				<Select label={t('option-compression')} options={levels} value={options.level} onchange={(value) => (options.level = value)} />
			</Field>
		{:else if format !== 'folder'}
			<DocumentOptions {options} {format} {file} />
		{/if}
		{#if expandable}
			<button type="button" class="more" aria-expanded={advanced} onclick={() => (advanced = !advanced)}>
				{t('option-more')}
				<ChevronDown size={14} style={advanced ? 'transform: rotate(180deg)' : ''} />
			</button>
		{/if}
		{#if advanced && shrinkable}
			<Field label={t('option-target-size')}>
				<SizeField {options} />
			</Field>
		{/if}
	</div>
{/if}

<style>
	.more {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		align-self: flex-start;
		font-size: 13px;
		color: var(--text-muted);
	}

	.more:hover {
		color: var(--text);
	}

	.more:focus-visible {
		outline: 2px solid var(--control-focus);
		outline-offset: 2px;
		border-radius: 4px;
	}
</style>
