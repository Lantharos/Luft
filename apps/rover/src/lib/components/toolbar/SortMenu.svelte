<script lang="ts">
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import Icon from '$lib/components/Icon.svelte';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import type { SortBy } from '$lib/types';

	interface Props {
		manager: FileManager;
	}

	let { manager }: Props = $props();

	const FIELDS: { value: SortBy; label: string }[] = [
		{ value: 'name', label: 'Name' },
		{ value: 'date', label: 'Modified' },
		{ value: 'size', label: 'Size' },
		{ value: 'type', label: 'Kind' }
	];

	function choose(value: SortBy, close: () => void) {
		if (value !== settings.value.sortBy) manager.setSortBy(value);
		close();
	}

	function direction(ascending: boolean, close: () => void) {
		settings.update((current) => ({ ...current, sortAsc: ascending }));
		close();
	}
</script>

<MenuButton label="Sort" class="icon-button" align="end" minWidth={180} {@attach tooltip('Sort')}>
	{#snippet trigger()}
		<Icon name={settings.value.sortAsc ? 'sort-asc' : 'sort-desc'} size={17} />
	{/snippet}
	{#snippet children(close)}
		{#each FIELDS as field (field.value)}
			<MenuItem checked={settings.value.sortBy === field.value} onclick={() => choose(field.value, close)}>
				<span class="flex-1">{field.label}</span>
				{#if settings.value.sortBy === field.value}
					<Icon name="check" size={14} />
				{/if}
			</MenuItem>
		{/each}
		<MenuSeparator />
		{#each [true, false] as ascending (ascending)}
			<MenuItem checked={settings.value.sortAsc === ascending} onclick={() => direction(ascending, close)}>
				<span class="flex-1">{ascending ? 'Ascending' : 'Descending'}</span>
				{#if settings.value.sortAsc === ascending}
					<Icon name="check" size={14} />
				{/if}
			</MenuItem>
		{/each}
	{/snippet}
</MenuButton>
