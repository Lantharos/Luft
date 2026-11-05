<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, Select, TextField } from '@luft/ui';
	import type { FileEntry, Options, PageSize } from '#lib/bindings.js';
	import { PAGE_IMAGES } from '#lib/state/formats.js';
	import Field from './fields/Field.svelte';
	import Toggle from './fields/Toggle.svelte';

	interface Props {
		options: Options;
		format: string;
		file: FileEntry;
	}

	let { options, format, file }: Props = $props();

	const RESOLUTIONS = [72, 96, 150, 200, 300, 600];

	const fromPdf = $derived(file.format === 'pdf');
	const toPictures = $derived(fromPdf && PAGE_IMAGES.includes(format));
	const sizes = $derived<{ value: PageSize; label: string }[]>([
		{ value: 'fit', label: t('option-page-fit') },
		{ value: 'a4', label: t('option-page-a4') },
		{ value: 'letter', label: t('option-page-letter') }
	]);
	const resolutions = $derived(RESOLUTIONS.map((value) => ({ value, label: t('option-dpi', { value }) })));
</script>

{#if fromPdf}
	<Field label={t('option-pages')}>
		<TextField label={t('option-pages')} placeholder={t('option-pages-all')} bind:value={options.pages} />
	</Field>
{/if}
{#if toPictures}
	<Field label={t('option-resolution')}>
		<Select label={t('option-resolution')} options={resolutions} value={options.dpi} onchange={(value) => (options.dpi = value)} />
	</Field>
{/if}
{#if fromPdf && format === 'pdf'}
	<Toggle label={t('option-split')} description={t('option-split-note')} checked={options.split} onchange={(value) => (options.split = value)} />
{/if}
{#if file.family === 'image' && format === 'pdf'}
	<Field label={t('option-page-size')}>
		<Segmented label={t('option-page-size')} options={sizes} value={options.pageSize} onchange={(value) => (options.pageSize = value)} />
	</Field>
{/if}
