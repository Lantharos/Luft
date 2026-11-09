<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { activationToken, Dialog, errorText, ProgressBar, Row, Segmented, Select, Switch, TextField } from '@luft/ui';
	import { commands, type Format, type PaperSize, type Saved } from '#lib/bindings.js';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	let { onclose }: { onclose: () => void } = $props();

	const FILTERS: Record<Format, string> = { pdf: 'save-filter-pdf', jpeg: 'save-filter-jpeg', png: 'save-filter-png' };

	let format = $state<Format>('pdf');
	let name = $state(t('save-default-name', { date: new Intl.DateTimeFormat(i18n.formats, { dateStyle: 'long' }).format(new Date()) }));
	let searchable = $state(true);
	let saved = $state<Saved | null>(null);
	let problem = $state('');
	let busy = $derived(flatbed.saving !== null);
	let canRead = $derived(Boolean(flatbed.readingLanguages?.length && flatbed.settings.languages.length));
	let several = $derived(format !== 'pdf' && flatbed.pages.length > 1);

	const formats = $derived<{ value: Format; label: string }[]>([
		{ value: 'pdf', label: t('format-pdf') },
		{ value: 'jpeg', label: t('format-jpeg') },
		{ value: 'png', label: t('format-png') }
	]);
	const papers = $derived<{ value: PaperSize; label: string }[]>([
		{ value: 'automatic', label: t('paper-automatic') },
		{ value: 'a4', label: t('paper-a4') },
		{ value: 'letter', label: t('paper-letter') }
	]);

	async function save() {
		problem = '';
		flatbed.saving = 0;
		try {
			saved = await commands.save(
				{
					format,
					searchable: canRead && searchable,
					name: name.trim() || t('save-fallback-name'),
					title: several ? t('save-folder-title') : t('save-title'),
					filter: t(FILTERS[format])
				},
				{ timeoutMs: 24 * 60 * 60 * 1000 }
			);
		} catch (error) {
			problem = errorText(error);
		} finally {
			flatbed.saving = null;
		}
	}

	async function reveal() {
		if (saved) await commands.reveal({ path: saved.path, token: await activationToken() });
	}

	async function openWith() {
		if (saved) await commands.openWith({ path: saved.path, token: await activationToken() });
	}
</script>

<Dialog
	title={saved ? t('saved-title') : t('save-dialog-title')}
	description={saved ? (saved.files > 1 ? t('saved-several', { count: saved.files }) : t('saved-one')) : undefined}
	wide
	onclose={() => !busy && onclose()}
>
	{#if !saved}
		<div class="flex flex-col gap-4">
			<TextField bind:value={name} label={t('save-name')} showLabel disabled={busy} />
			<Segmented label={t('save-format')} options={formats} value={format} onchange={(value) => (format = value)} />
			<div class="row-group">
				{#if format === 'pdf'}
					<Row title={t('save-searchable')} description={canRead ? t('save-searchable-detail') : t('save-searchable-missing')}>
						<Switch label={t('save-searchable')} checked={canRead && searchable} disabled={!canRead || busy} onchange={(value) => (searchable = value)} />
					</Row>
					<Row title={t('save-paper')}>
						<Select
							label={t('save-paper')}
							options={papers}
							value={flatbed.settings.paper}
							disabled={busy}
							onchange={(paper) => void flatbed.saveSettings({ ...flatbed.settings, paper })}
						/>
					</Row>
				{:else}
					<Row title={several ? t('save-pictures-several', { count: flatbed.pages.length }) : t('save-pictures-one')} />
				{/if}
			</div>
			{#if busy}
				<ProgressBar fraction={flatbed.saving || null} class="h-1" />
				<p class="text-[13px] text-[var(--text-soft)]">{format === 'pdf' && canRead && searchable ? t('save-reading') : t('save-saving')}</p>
			{/if}
			{#if problem}
				<p class="text-[13px] text-[var(--danger)]">{t('save-failed', { reason: problem })}</p>
			{/if}
		</div>
	{/if}
	{#snippet actions()}
		{#if saved}
			<button type="button" class="button mr-auto" onclick={() => void openWith()}>{t('saved-open-with')}</button>
			<button type="button" class="button" onclick={() => void reveal()}>{t('saved-show')}</button>
			<button type="button" class="button primary" onclick={onclose}>{t('dialog-done')}</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={onclose}>{t('dialog-cancel')}</button>
			<button type="button" class="button primary" disabled={busy} onclick={() => void save()}>{several ? t('save-choose-folder') : t('save-choose-file')}</button>
		{/if}
	{/snippet}
</Dialog>
