<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { SortBy } from '$lib/types';

	interface Props {
		sortBy: SortBy;
		sortAsc: boolean;
		onSort: (sortBy: SortBy) => void;
	}

	let { sortBy, sortAsc, onSort }: Props = $props();
	let open = $state(false);

	const OPTIONS: { value: SortBy; label: string }[] = [
		{ value: 'name', label: 'Name' },
		{ value: 'date', label: 'Modified' },
		{ value: 'size', label: 'Size' },
		{ value: 'type', label: 'Type' }
	];

	let directionIcon = $derived<'sort-asc' | 'sort-desc'>(sortAsc ? 'sort-asc' : 'sort-desc');
</script>

<svelte:window onclick={() => (open = false)} />

<div class="relative">
	<button
		class="command-button"
		type="button"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={(event) => {
			event.stopPropagation();
			open = !open;
		}}
	>
		<Icon name={directionIcon} size={16} />
		<span>{OPTIONS.find((option) => option.value === sortBy)?.label}</span>
	</button>
	{#if open}
		<div
			class="absolute right-0 top-[calc(100%+6px)] z-50 w-[156px] rounded-[18px] bg-[var(--surface)] p-1 shadow-[0_18px_50px_var(--shadow-soft),inset_0_1px_0_var(--hairline)]"
			role="menu"
		>
			{#each OPTIONS as option (option.value)}
				<button
					class={[
						'flex h-9 w-full items-center justify-between rounded-full px-3 text-left text-[13px] transition-[background-color,color] duration-150 hover:bg-[var(--surface-soft)]',
						sortBy === option.value ? 'text-[var(--text)]' : 'text-[var(--text-soft)]'
					]}
					type="button"
					role="menuitem"
					onclick={() => {
						onSort(option.value);
						open = false;
					}}
				>
					<span>{option.label}</span>
					{#if sortBy === option.value}
						<Icon name={directionIcon} size={14} />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
