<script lang="ts">
	import Archive from '@lucide/svelte/icons/archive';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash from '@lucide/svelte/icons/trash-2';
	import { t } from '@luft/i18n';
	import { Dialog, droppedPaths, relativeDay } from '@luft/ui';
	import { importBooks } from '#lib/pdf/import.js';
	import { recent } from '#lib/app/recent.svelte.js';
	import { session } from '#lib/app/session.svelte.js';
	import { library } from '#lib/library/library.svelte.js';
	import Thumbnail from '#lib/rail/Thumbnail.svelte';
	import Header from '#lib/shell/Header.svelte';
	import SubjectDialog from './SubjectDialog.svelte';
	import SubjectRow from './SubjectRow.svelte';
	import TrashDialog from './TrashDialog.svelte';

	let dialog: 'subject' | 'archive' | 'trash' | null = $state(null);

	function drop(event: DragEvent) {
		const paths = event.dataTransfer ? droppedPaths(event.dataTransfer) : [];
		if (!paths.length) return;
		event.preventDefault();
		const id = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-subject]')?.dataset.subject;
		const subject = id ? library.subject(id) : library.active[0];
		if (subject) void importBooks(subject, paths);
	}

	let recentPages = $derived(
		recent.pages.flatMap((item) => {
			const entry = library.notebook(item.notebook);
			const page = entry?.meta.pages.find((candidate) => candidate.id === item.page);
			return entry && page ? [{ entry, page, at: item.at, notebook: library.openNotebook(entry) }] : [];
		})
	);
</script>

<main class="glass-content" ondragover={(event) => event.preventDefault()} ondrop={drop}>
	<Header />
	<div class="min-h-0 flex-1 overflow-y-auto soft-scroll">
		<div class="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 pt-4 pb-10">
			{#if recentPages.length}
				<section class="flex flex-col gap-3 px-4">
					<h2 class="text-[16px] font-semibold">{t('home-recent')}</h2>
					<div class="flex gap-4 overflow-x-auto pb-2 hidden-scroll">
						{#each recentPages as item (item.page.id)}
							<button type="button" class="recent" onclick={() => session.open(item.entry, item.page.id)}>
								<Thumbnail notebook={item.notebook} entry={item.page} width={112} />
								<span class="truncate text-[12.5px] font-medium">{item.entry.meta.name}</span>
								<span class="text-[11.5px] text-(--text-muted)">{relativeDay(Math.floor(item.at / 1000))}</span>
							</button>
						{/each}
					</div>
				</section>
			{/if}
			<div class="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-x-4 gap-y-2">
				{#each library.active as subject (subject.meta.id)}
					<SubjectRow {subject} />
				{/each}
			</div>
			<div class="flex flex-wrap gap-2 px-4">
				<button type="button" class="button" onclick={() => (dialog = 'subject')}><Plus size={16} />{t('home-new-subject')}</button>
				<button type="button" class="plain-button" disabled={!library.archived.length} onclick={() => (dialog = 'archive')}><Archive size={16} />{t('home-archive')}</button>
				<button type="button" class="plain-button" onclick={() => (dialog = 'trash')}><Trash size={16} />{t('home-trash')}</button>
			</div>
		</div>
	</div>
</main>

{#if dialog === 'subject'}
	<SubjectDialog onclose={() => (dialog = null)} />
{:else if dialog === 'trash'}
	<TrashDialog onclose={() => (dialog = null)} />
{:else if dialog === 'archive'}
	<Dialog title={t('archive-title')} description={t('archive-body')} onclose={() => (dialog = null)}>
		<ul class="flex flex-col">
			{#each library.archived as subject (subject.meta.id)}
				<li class="flex items-center gap-3 py-2">
					<span class="size-3 rounded-full" style:background={subject.meta.color}></span>
					<span class="min-w-0 flex-1 truncate text-[14px] font-medium">{subject.meta.name}</span>
					<button type="button" class="button" onclick={() => void library.updateSubject(subject, { archived: false })}>{t('archive-restore')}</button>
				</li>
			{/each}
		</ul>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (dialog = null)}>{t('dialog-done')}</button>
		{/snippet}
	</Dialog>
{/if}

<style>
	.recent {
		display: flex;
		width: 112px;
		flex: none;
		flex-direction: column;
		gap: 4px;
		text-align: left;
	}
</style>
