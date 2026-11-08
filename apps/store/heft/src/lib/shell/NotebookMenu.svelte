<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem } from '@luft/ui';
	import { library } from '#lib/library/library.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import PaperDialog from '#lib/paper/PaperDialog.svelte';
	import { session } from '#lib/app/session.svelte.js';
	import { choosePdfs } from '#lib/pdf/import.js';
	import { insertPdf } from '#lib/pdf/sources.js';
	import BesideDialog from './BesideDialog.svelte';
	import DeletedPagesDialog from './DeletedPagesDialog.svelte';
	import NameDialog from './NameDialog.svelte';

	let { notebook }: { notebook: OpenNotebook } = $props();

	let dialog: 'rename' | 'paper' | 'deleted' | 'beside' | null = $state(null);

	async function addPdfPages() {
		for (const path of await choosePdfs()) await insertPdf(notebook, path, notebook.meta.pages.length);
	}

	async function rename(name: string) {
		const subject = library.subjectOf(notebook.entry);
		if (subject) await library.placeNotebook(notebook.entry, name, subject);
	}
</script>

<MenuButton label={t('notebook-menu')} class="plain-button min-w-0">
	{#snippet trigger()}
		<span class="truncate font-semibold text-(--text)">{notebook.meta.name}</span>
		<ChevronDown size={15} />
	{/snippet}
	{#snippet children(close)}
		<MenuItem onclick={() => ((dialog = 'rename'), close())}>{t('notebook-rename')}</MenuItem>
		<MenuItem onclick={() => ((dialog = 'paper'), close())}>{t('notebook-paper')}</MenuItem>
		{#if session.beside}
			<MenuItem onclick={() => (session.unsplit(), close())}>{t('notebook-unsplit')}</MenuItem>
		{:else}
			<MenuItem onclick={() => ((dialog = 'beside'), close())}>{t('notebook-split')}</MenuItem>
		{/if}
		<MenuItem onclick={() => (close(), void addPdfPages())}>{t('notebook-insert-pdf')}</MenuItem>
		<MenuItem disabled={!notebook.meta.trashed?.length} onclick={() => ((dialog = 'deleted'), close())}>{t('notebook-deleted-pages')}</MenuItem>
	{/snippet}
</MenuButton>

{#if dialog === 'rename'}
	<NameDialog title={t('notebook-rename-title')} label={t('notebook-name')} action={t('dialog-save')} value={notebook.meta.name} onsave={rename} onclose={() => (dialog = null)} />
{:else if dialog === 'paper'}
	<PaperDialog
		paper={notebook.meta.paper}
		onsave={(paper) => {
			notebook.meta.paper = paper;
			notebook.changed();
		}}
		onclose={() => (dialog = null)}
	/>
{:else if dialog === 'beside'}
	<BesideDialog {notebook} onclose={() => (dialog = null)} />
{:else if dialog === 'deleted'}
	<DeletedPagesDialog {notebook} onclose={() => (dialog = null)} />
{/if}
