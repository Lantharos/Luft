<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText } from '@luft/ui';
	import { library, type SubjectEntry } from '#lib/library/library.svelte.js';
	import { importBooks } from '#lib/pdf/import.js';
	import { bookName } from '#lib/pdf/sources.js';

	let { paths, onclose }: { paths: string[]; onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

	async function pick(subject: SubjectEntry) {
		busy = true;
		try {
			await importBooks(subject, paths);
			onclose();
		} catch (reason) {
			error = errorText(reason);
			busy = false;
		}
	}
</script>

<Dialog title={t('import-title', { count: paths.length, name: bookName(paths[0]) })} description={t('import-body')} {onclose}>
	<div class="flex max-h-[360px] flex-col overflow-y-auto soft-scroll">
		{#each library.active as subject (subject.meta.id)}
			<button type="button" class="choice" disabled={busy} onclick={() => void pick(subject)}>
				<span class="size-3 rounded-full" style:background={subject.meta.color}></span>
				<span class="truncate">{subject.meta.name}</span>
			</button>
		{/each}
	</div>
	{#if error}<p class="text-[12px] text-(--danger)">{error}</p>{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
	{/snippet}
</Dialog>

<style>
	.choice {
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 10px;
		border-radius: 12px;
		padding-inline: 12px;
		font-size: 14px;
		text-align: left;
	}

	.choice:hover:not(:disabled) {
		background: var(--surface-hover);
	}
</style>
