<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import type { Sort } from '#lib/state/settings.svelte.js';
	import type { Column } from './columns';

	interface Props {
		columns: Column[];
		sort: Sort;
		onsort: (column: string) => void;
		onmenu: (event: MouseEvent) => void;
	}

	let { columns, sort, onsort, onmenu }: Props = $props();
</script>

{#snippet heading(id: string, label: string, numeric: boolean)}
	<button type="button" class="heading" class:numeric class:active={sort.column === id} onclick={() => onsort(id)}>
		<span class="truncate">{label}</span>
		{#if sort.column === id}
			{#if sort.direction === 'ascending'}
				<ChevronUp size={13} />
			{:else}
				<ChevronDown size={13} />
			{/if}
		{/if}
	</button>
{/snippet}

<div class="table-grid table-header" role="row" tabindex="-1" oncontextmenu={onmenu}>
	{@render heading('name', 'Name', false)}
	{#each columns as column (column.id)}
		{@render heading(column.id, column.label, column.numeric)}
	{/each}
</div>

<style>
	.table-header {
		height: 36px;
		align-items: center;
		padding-inline: 10px;
		background: var(--content);
		border-bottom: 1px solid var(--hairline);
	}

	.heading {
		display: flex;
		min-width: 0;
		height: 28px;
		align-items: center;
		gap: 4px;
		border-radius: 8px;
		padding-inline: 8px;
		font-size: 12.5px;
		color: var(--text-muted);
		transition:
			background-color 140ms var(--ease),
			color 140ms var(--ease);
	}

	.heading.numeric {
		flex-direction: row-reverse;
		justify-content: flex-start;
		text-align: right;
	}

	.heading:hover {
		background: var(--surface-hover);
		color: var(--text-soft);
	}

	.heading.active {
		color: var(--text);
	}
</style>
