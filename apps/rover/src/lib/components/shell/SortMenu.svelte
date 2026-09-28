<script lang="ts">
	import { MenuItem, Popover } from '@luft/ui';
	import Icon from '$lib/components/Icon.svelte';
	import type { SortBy } from '$lib/types';

	interface Props {
		sortBy: SortBy;
		sortAsc: boolean;
		onSort: (sortBy: SortBy) => void;
	}

	let { sortBy, sortAsc, onSort }: Props = $props();

	const MENU_WIDTH = 156;
	const OPTIONS: { value: SortBy; label: string }[] = [
		{ value: 'name', label: 'Name' },
		{ value: 'date', label: 'Modified' },
		{ value: 'size', label: 'Size' },
		{ value: 'type', label: 'Type' }
	];

	let trigger = $state<HTMLButtonElement>();
	let open = $state(false);

	let directionIcon = $derived<'sort-asc' | 'sort-desc'>(sortAsc ? 'sort-asc' : 'sort-desc');

	function choose(value: SortBy) {
		onSort(value);
		open = false;
	}
</script>

<button bind:this={trigger} class="button large" type="button" aria-haspopup="menu" aria-expanded={open} onclick={() => (open = !open)}>
	<Icon name={directionIcon} size={16} />
	<span>{OPTIONS.find((option) => option.value === sortBy)?.label}</span>
</button>

{#if open && trigger}
	<Popover anchor={trigger} label="Sort by" role="menu" align="end" minWidth={MENU_WIDTH} onclose={() => (open = false)}>
		{#each OPTIONS as option (option.value)}
			<MenuItem checked={sortBy === option.value} onclick={() => choose(option.value)}>
				<span class="flex-1">{option.label}</span>
				{#if sortBy === option.value}
					<Icon name={directionIcon} size={14} />
				{/if}
			</MenuItem>
		{/each}
	</Popover>
{/if}
