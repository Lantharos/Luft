<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import Plus from '@lucide/svelte/icons/plus';
	import { t } from '@luft/i18n';
	import { ConfirmDialog, IconButton, MenuButton, MenuItem, MenuSeparator } from '@luft/ui';
	import { session } from '#lib/app/session.svelte.js';
	import { draggable, dropTarget } from '#lib/drag/drag.svelte.js';
	import { library, type SubjectEntry } from '#lib/library/library.svelte.js';
	import NewNotebookDialog from './NewNotebookDialog.svelte';
	import NotebookCover from './NotebookCover.svelte';
	import SubjectDialog from './SubjectDialog.svelte';

	let { subject }: { subject: SubjectEntry } = $props();

	let dialog: 'edit' | 'notebook' | 'trash' | null = $state(null);
	let notebooks = $derived([...subject.notebooks].sort((a, b) => b.meta.modified - a.meta.modified));
</script>

<section class="subject" {@attach dropTarget({ kind: 'subject', id: subject.meta.id })}>
	<div class="flex items-center gap-2">
		<h2
			class="flex min-w-0 items-center gap-2.5 text-[16px] font-semibold"
			{@attach draggable(
				() => ({ kind: 'subject', id: subject.meta.id }),
				() => subject.meta.name
			)}
		>
			<span class="size-3 flex-none rounded-full" style:background={subject.meta.color}></span>
			<span class="truncate">{subject.meta.name}</span>
		</h2>
		<MenuButton label={t('subject-options', { name: subject.meta.name })} class="icon-button">
			{#snippet trigger()}<Ellipsis size={17} />{/snippet}
			{#snippet children(close)}
				<MenuItem onclick={() => ((dialog = 'edit'), close())}>{t('subject-edit')}</MenuItem>
				<MenuItem onclick={() => (void library.updateSubject(subject, { archived: !subject.meta.archived }), close())}>
					{subject.meta.archived ? t('subject-unarchive') : t('subject-archive')}
				</MenuItem>
				<MenuSeparator />
				<MenuItem danger onclick={() => ((dialog = 'trash'), close())}>{t('subject-trash')}</MenuItem>
			{/snippet}
		</MenuButton>
		<div class="flex-1"></div>
		{#if subject.notebooks.length && !subject.meta.archived}
			<IconButton icon={PenLine} label={t('subject-new-page')} onclick={() => session.newPageIn(subject.meta.id)} />
		{/if}
	</div>
	<div class="flex gap-4 overflow-x-auto pt-4 pb-2 hidden-scroll">
		{#each notebooks as notebook (notebook.meta.id)}
			<NotebookCover {notebook} color={subject.meta.color} />
		{/each}
		<button type="button" class="new" onclick={() => (dialog = 'notebook')}>
			<span class="slot"><Plus size={22} /></span>
			<span class="text-[12px] text-(--text-muted)">{t('subject-new-notebook')}</span>
		</button>
	</div>
</section>

{#if dialog === 'edit'}
	<SubjectDialog {subject} onclose={() => (dialog = null)} />
{:else if dialog === 'notebook'}
	<NewNotebookDialog {subject} onclose={() => (dialog = null)} />
{:else if dialog === 'trash'}
	<ConfirmDialog
		title={t('subject-trash-title', { name: subject.meta.name })}
		description={t('subject-trash-body')}
		action={t('subject-trash')}
		run={async () => {
			await library.trashSubject(subject);
			session.prune();
		}}
		onclose={() => (dialog = null)}
	/>
{/if}

<style>
	.subject {
		border-radius: 18px;
		padding: 14px 16px 10px;
		transition: background-color var(--motion-quick);
	}

	.subject:global([data-drop-over]) {
		background: var(--accent-soft);
	}

	h2 {
		cursor: grab;
	}

	.new {
		display: flex;
		width: 104px;
		flex: none;
		flex-direction: column;
		gap: 8px;
	}

	.slot {
		display: grid;
		aspect-ratio: 3 / 4;
		place-items: center;
		border-radius: 6px 12px 12px 6px;
		background: var(--surface);
		color: var(--text-muted);
		transition: background-color var(--motion-tap);
	}

	.new:hover .slot {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
