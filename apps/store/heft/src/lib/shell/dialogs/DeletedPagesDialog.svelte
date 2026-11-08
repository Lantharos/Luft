<script lang="ts">
	import { t } from '@luft/i18n';
	import { ago, Dialog } from '@luft/ui';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import Thumbnail from '#lib/rail/Thumbnail.svelte';

	let { notebook, onclose }: { notebook: OpenNotebook; onclose: () => void } = $props();

	let items = $derived([...(notebook.meta.trashed ?? [])].reverse());
</script>

<Dialog title={t('deleted-pages-title')} description={t('deleted-pages-body')} wide {onclose}>
	<div class="grid max-h-[420px] grid-cols-4 gap-3 overflow-y-auto soft-scroll">
		{#each items as item (item.page.id)}
			<div class="flex flex-col items-center gap-2">
				<Thumbnail {notebook} entry={item.page} width={120} />
				<span class="text-[11.5px] text-(--text-muted)">{ago(Math.floor(item.at / 1000))}</span>
				<button type="button" class="button" onclick={() => notebook.restorePage(item.page.id)}>{t('deleted-pages-restore')}</button>
			</div>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('dialog-done')}</button>
	{/snippet}
</Dialog>
