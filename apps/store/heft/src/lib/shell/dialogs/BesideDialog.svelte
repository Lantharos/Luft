<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import NotebookText from '@lucide/svelte/icons/notebook-text';
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { session } from '#lib/app/session.svelte.js';
	import { library } from '#lib/library/library.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';

	let { notebook, onclose }: { notebook: OpenNotebook; onclose: () => void } = $props();

	let subjects = $derived(
		[...library.active].sort((a, b) => Number(b.meta.id === notebook.meta.subject) - Number(a.meta.id === notebook.meta.subject)).filter((subject) => subject.notebooks.some((entry) => entry.meta.id !== notebook.meta.id))
	);
</script>

<Dialog title={t('beside-title')} description={t('beside-body')} {onclose}>
	<div class="flex max-h-[420px] flex-col gap-4 overflow-y-auto soft-scroll">
		{#each subjects as subject (subject.meta.id)}
			<section class="flex flex-col gap-1">
				<h3 class="flex items-center gap-2 px-2 text-[12.5px] font-semibold text-(--text-soft)">
					<span class="size-2.5 rounded-full" style:background={subject.meta.color}></span>{subject.meta.name}
				</h3>
				{#each subject.notebooks.filter((entry) => entry.meta.id !== notebook.meta.id) as entry (entry.meta.id)}
					<button type="button" class="choice" onclick={() => (session.split(entry), onclose())}>
						{#if entry.meta.kind === 'book'}<BookOpen size={17} />{:else}<NotebookText size={17} />{/if}
						<span class="truncate">{entry.meta.name}</span>
					</button>
				{/each}
			</section>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
	{/snippet}
</Dialog>

<style>
	.choice {
		display: flex;
		min-height: 40px;
		align-items: center;
		gap: 10px;
		border-radius: 12px;
		padding-inline: 10px;
		color: var(--text);
		font-size: 14px;
		text-align: left;
	}

	.choice:hover {
		background: var(--surface-hover);
	}
</style>
