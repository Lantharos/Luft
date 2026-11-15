<script lang="ts">
	import { t } from '@luft/i18n';
	import { SearchField, tooltip } from '@luft/ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import X from '@lucide/svelte/icons/x';
	import { documentState } from './state.svelte';

	let field = $state<{ focus: () => void }>();

	$effect(() => {
		field?.focus();
	});

	$effect(() => {
		void documentState.query;
		documentState.find(false, false);
	});

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter') documentState.find(event.shiftKey);
		else if (event.key === 'Escape') documentState.closeFind();
		else return;
		event.preventDefault();
		event.stopPropagation();
	}
</script>

<div class="flex items-center gap-1">
	<div class="w-[220px]">
		<SearchField bind:this={field} bind:value={documentState.query} label={t('magpie-document-find-label')} onkeydown={keydown} />
	</div>
	{#if documentState.query}
		<span class="min-w-[64px] text-center text-[12px] text-[var(--text-muted)] tabular-nums">
			{documentState.matches.total ? t('magpie-document-matches', { current: documentState.matches.current, total: documentState.matches.total }) : t('magpie-document-no-matches')}
		</span>
	{/if}
	<button type="button" class="icon-button" aria-label={t('magpie-document-previous-match')} disabled={!documentState.matches.total} onclick={() => documentState.find(true)} {@attach tooltip(t('magpie-document-previous-match'))}>
		<ChevronUp size={17} />
	</button>
	<button type="button" class="icon-button" aria-label={t('magpie-document-next-match')} disabled={!documentState.matches.total} onclick={() => documentState.find()} {@attach tooltip(t('magpie-document-next-match'))}>
		<ChevronDown size={17} />
	</button>
	<button type="button" class="icon-button" aria-label={t('magpie-document-close-find')} onclick={() => documentState.closeFind()} {@attach tooltip(t('magpie-document-close-find'))}>
		<X size={17} />
	</button>
</div>
