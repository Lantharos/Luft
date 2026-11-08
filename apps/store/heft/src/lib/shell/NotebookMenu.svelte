<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem } from '@luft/ui';
	import { library } from '#lib/library/library.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import PaperDialog from '#lib/paper/PaperDialog.svelte';
	import DeletedPagesDialog from './DeletedPagesDialog.svelte';
	import NameDialog from './NameDialog.svelte';

	let { notebook }: { notebook: OpenNotebook } = $props();

	let dialog: 'rename' | 'paper' | 'deleted' | null = $state(null);

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
{:else if dialog === 'deleted'}
	<DeletedPagesDialog {notebook} onclose={() => (dialog = null)} />
{/if}
