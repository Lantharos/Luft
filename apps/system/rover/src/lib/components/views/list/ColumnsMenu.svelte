<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import { columnLabel, type ListColumns } from '#lib/file-manager/view/list-columns.svelte.js';

	interface Props {
		at: { x: number; y: number };
		columns: ListColumns;
		recent: boolean;
		onclose: () => void;
	}

	let { at, columns, recent, onclose }: Props = $props();

	function choose(action: () => void) {
		action();
		onclose();
	}
</script>

<svelte:window onpointerdown={onclose} />

<ContextMenu {at} {onclose}>
	{#each columns.all as column (column.id)}
		<MenuItem checked={column.visible} onclick={() => choose(() => columns.toggle(column.id))}>
			<span class="flex-1">{columnLabel(column.id, recent)}</span>
			{#if column.visible}
				<Check size={14} />
			{/if}
		</MenuItem>
	{/each}
	<MenuSeparator />
	<MenuItem onclick={() => choose(columns.reset)}>
		<span class="flex-1">Reset columns</span>
	</MenuItem>
</ContextMenu>
