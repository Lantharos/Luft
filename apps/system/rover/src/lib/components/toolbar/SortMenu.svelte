<script lang="ts">
	import ArrowDownWideNarrow from '@lucide/svelte/icons/arrow-down-wide-narrow';
	import ArrowUpNarrowWide from '@lucide/svelte/icons/arrow-up-narrow-wide';
	import Check from '@lucide/svelte/icons/check';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import type { GroupBy, SortBy } from '#lib/bindings.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';

	interface Props {
		manager: FileManager;
	}

	let { manager }: Props = $props();

	let fields: { value: SortBy; label: string }[] = $derived([
		{ value: 'name', label: t('rover-sort-name') },
		{ value: 'date', label: t('rover-sort-modified') },
		{ value: 'size', label: t('rover-sort-size') },
		{ value: 'type', label: t('rover-sort-kind') }
	]);

	let groups: { value: GroupBy; label: string }[] = $derived([
		{ value: 'none', label: t('rover-sort-group-none') },
		{ value: 'kind', label: t('rover-sort-group-kind') },
		{ value: 'date', label: t('rover-sort-group-date') }
	]);

	let groupable = $derived(manager.viewMode === 'list');

	function group(value: GroupBy, close: () => void) {
		manager.setGroupBy(value);
		close();
	}

	function choose(value: SortBy, close: () => void) {
		if (value !== settings.value.sortBy) manager.setSortBy(value);
		close();
	}

	function direction(ascending: boolean, close: () => void) {
		settings.update((current) => ({ ...current, sortAsc: ascending }));
		close();
	}
</script>

<MenuButton label={t('rover-sort')} class="icon-button" align="end" minWidth={180} {@attach tooltip(t('rover-sort'))}>
	{#snippet trigger()}
		{#if settings.value.sortAsc}
			<ArrowUpNarrowWide size={17} />
		{:else}
			<ArrowDownWideNarrow size={17} />
		{/if}
	{/snippet}
	{#snippet children(close)}
		{#each fields as field (field.value)}
			<MenuItem checked={settings.value.sortBy === field.value} onclick={() => choose(field.value, close)}>
				<span class="flex-1">{field.label}</span>
				{#if settings.value.sortBy === field.value}
					<Check size={14} />
				{/if}
			</MenuItem>
		{/each}
		<MenuSeparator />
		{#each [true, false] as ascending (ascending)}
			<MenuItem checked={settings.value.sortAsc === ascending} onclick={() => direction(ascending, close)}>
				<span class="flex-1">{ascending ? t('rover-sort-ascending') : t('rover-sort-descending')}</span>
				{#if settings.value.sortAsc === ascending}
					<Check size={14} />
				{/if}
			</MenuItem>
		{/each}
		{#if groupable}
			<MenuSeparator />
			{#each groups as option
 (option.value)}
				<MenuItem checked={settings.value.groupBy === option.value} onclick={() => group(option.value, close)}>
					<span class="flex-1">{option.label}</span>
					{#if settings.value.groupBy === option.value}
						<Check size={14} />
					{/if}
				</MenuItem>
			{/each}
		{/if}
	{/snippet}
</MenuButton>
