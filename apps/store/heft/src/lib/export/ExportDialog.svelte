<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Segmented, Spinner, Switch } from '@luft/ui';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { exportPdf, exportPng } from './export';

	let { notebook, current, format: initial = 'pdf', onclose }: { notebook: OpenNotebook; current: number; format?: 'pdf' | 'png'; onclose: () => void } = $props();

	type Range = 'page' | 'section' | 'notebook';

	let format = $state(untrack(() => initial));
	let range: Range = $state('page');
	let paper = $state(true);
	let busy = $state(false);
	let error = $state('');

	let section = $derived.by(() => {
		const starts = notebook.meta.sections.map((item) => ({ item, index: notebook.indexOf(item.page) })).filter(({ index }) => index >= 0 && index <= current);
		const start = starts.sort((a, b) => b.index - a.index)[0];
		if (!start) return null;
		const next = notebook.meta.sections.map((item) => notebook.indexOf(item.page)).filter((index) => index > start.index);
		return { title: start.item.title, from: start.index, to: Math.min(notebook.meta.pages.length, ...next) };
	});

	function pages() {
		const all = notebook.meta.pages;
		if (range === 'notebook') return all;
		if (range === 'section' && section) return all.slice(section.from, section.to);
		return [all[current]];
	}

	async function run() {
		busy = true;
		error = '';
		try {
			const name = range === 'section' && section ? section.title : range === 'page' ? t('export-page-name', { notebook: notebook.meta.name, page: current + 1 }) : notebook.meta.name;
			if (format === 'png') await exportPng(notebook, notebook.meta.pages[current], name);
			else await exportPdf(notebook, pages(), name, { paper });
			onclose();
		} catch (reason) {
			error = errorText(reason);
			busy = false;
		}
	}
</script>

<Dialog title={t('export-title')} {onclose}>
	<div class="flex flex-col gap-4">
		<Segmented
			label={t('export-format')}
			value={format}
			options={[
				{ value: 'pdf', label: t('export-pdf') },
				{ value: 'png', label: t('export-png') }
			]}
			onchange={(next) => (format = next)}
		/>
		{#if format === 'pdf'}
			<Segmented
				label={t('export-range')}
				value={range}
				options={[
					{ value: 'page' as Range, label: t('export-this-page') },
					...(section ? [{ value: 'section' as Range, label: t('export-this-section') }] : []),
					{ value: 'notebook' as Range, label: t('export-whole-notebook') }
				]}
				onchange={(next) => (range = next)}
			/>
			<div class="flex items-center justify-between gap-4">
				<span class="text-[13px]">{t('export-paper')}</span>
				<Switch label={t('export-paper')} checked={paper} onchange={(next) => (paper = next)} />
			</div>
		{/if}
		{#if error}<p class="text-[12px] text-(--danger)">{error}</p>{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={() => void run()}>
			{#if busy}<Spinner />{/if}
			{t('export-save')}
		</button>
	{/snippet}
</Dialog>
