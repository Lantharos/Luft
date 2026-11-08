<script lang="ts">
	import { t } from '@luft/i18n';
	import { ago, Dialog, errorText } from '@luft/ui';
	import { commands, type Trashed } from '#lib/bindings.js';
	import { library } from '#lib/library/library.svelte.js';

	let { onclose }: { onclose: () => void } = $props();

	let items: Trashed[] = $state([]);
	let error = $state('');

	async function refresh() {
		items = await commands.trashList();
	}

	void refresh();

	const name = (item: Trashed) => item.from.slice(item.from.lastIndexOf('/') + 1).replace(/\.heft$/, '');

	async function act(action: () => Promise<unknown>) {
		error = '';
		try {
			await action();
			await refresh();
		} catch (reason) {
			error = errorText(reason);
		}
	}
</script>

<Dialog title={t('trash-title')} description={t('trash-body')} {onclose}>
	<ul class="flex max-h-[360px] flex-col overflow-y-auto soft-scroll">
		{#each items as item (item.id)}
			<li class="flex items-center gap-3 py-2">
				<div class="min-w-0 flex-1">
					<p class="truncate text-[14px] font-medium">{name(item)}</p>
					<p class="text-[12px] text-(--text-muted)">{ago(item.trashedAt)}</p>
				</div>
				<button type="button" class="plain-button" onclick={() => void act(() => commands.trashPurge({ id: item.id }))}>{t('trash-delete')}</button>
				<button type="button" class="button" onclick={() => void act(() => library.restore(item))}>{t('trash-restore')}</button>
			</li>
		{:else}
			<li class="py-6 text-center text-[13px] text-(--text-muted)">{t('trash-empty')}</li>
		{/each}
	</ul>
	{#if error}<p class="text-[12px] text-(--danger)">{error}</p>{/if}
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('dialog-done')}</button>
	{/snippet}
</Dialog>
