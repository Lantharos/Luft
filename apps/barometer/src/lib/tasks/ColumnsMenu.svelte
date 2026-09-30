<script lang="ts">
	import { ContextMenu, MenuItem } from '@luft/ui';
	import Check from '@lucide/svelte/icons/check';
	import { COLUMNS } from './columns';

	interface Props {
		at: { x: number; y: number };
		available: string[];
		shown: string[];
		onchange: (shown: string[]) => void;
		onclose: () => void;
	}

	let { at, available, shown, onchange, onclose }: Props = $props();

	function toggle(id: string) {
		onchange(shown.includes(id) ? shown.filter((column) => column !== id) : COLUMNS.map((column) => column.id).filter((column) => column === id || shown.includes(column)));
	}
</script>

<svelte:window onpointerdown={onclose} />

<ContextMenu {at} {onclose}>
	{#each COLUMNS.filter((column) => available.includes(column.id)) as column (column.id)}
		<MenuItem checked={shown.includes(column.id)} onclick={() => toggle(column.id)}>
			<span class="grid w-4 place-items-center">
				{#if shown.includes(column.id)}
					<Check size={15} />
				{/if}
			</span>
			{column.label}
		</MenuItem>
	{/each}
</ContextMenu>
