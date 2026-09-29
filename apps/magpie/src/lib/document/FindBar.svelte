<script lang="ts">
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
		<SearchField bind:this={field} bind:value={documentState.query} label="Find in document" onkeydown={keydown} />
	</div>
	{#if documentState.query}
		<span class="min-w-[64px] text-center text-[12px] text-[var(--text-muted)] tabular-nums">
			{documentState.matches.total ? `${documentState.matches.current} of ${documentState.matches.total}` : 'No matches'}
		</span>
	{/if}
	<button type="button" class="icon-button" aria-label="Previous match" disabled={!documentState.matches.total} onclick={() => documentState.find(true)} {@attach tooltip('Previous match')}>
		<ChevronUp size={17} />
	</button>
	<button type="button" class="icon-button" aria-label="Next match" disabled={!documentState.matches.total} onclick={() => documentState.find()} {@attach tooltip('Next match')}>
		<ChevronDown size={17} />
	</button>
	<button type="button" class="icon-button" aria-label="Close search" onclick={() => documentState.closeFind()} {@attach tooltip('Close search')}>
		<X size={17} />
	</button>
</div>
