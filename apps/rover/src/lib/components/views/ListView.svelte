<script lang="ts">
	import { VirtualScroller } from '@luft/ui';
	import Icon from '$lib/components/Icon.svelte';
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import VcsBadge from '$lib/components/vcs/VcsBadge.svelte';
	import { thumbnailOf } from '$lib/file-manager/listing/thumbnails';
	import { entryClasses, entryContext, entryProps } from '$lib/file-manager/view/entry-props';
	import { EntrySurface } from '$lib/file-manager/view/surface.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import type { FileEntry, SortBy } from '$lib/types';
	import { entryIcon } from '$lib/utils/file-kinds';
	import { formatBytes, formatDate } from '$lib/utils/format';
	import { kindLabel } from '$lib/utils/kinds';
	import { parentPath } from '$lib/utils/paths';
	import EntryName from './EntryName.svelte';

	const LAYOUT = { itemHeight: 34, gap: 2, padding: { top: 2, right: 10, bottom: 24, left: 10 } };
	const COLUMNS: { sort: SortBy; label: string; class: string }[] = [
		{ sort: 'name', label: 'Name', class: '' },
		{ sort: 'date', label: 'Modified', class: 'list-date' },
		{ sort: 'size', label: 'Size', class: 'list-size' },
		{ sort: 'type', label: 'Kind', class: 'list-kind' }
	];

	const context = entryContext();
	const { manager, view, vcs } = context;
	const surface = new EntrySurface(context);

	let recent = $derived(manager.view === 'recent');
	let home = $derived(manager.homePath);

	$effect(() => view.attach(surface.viewport));

	function location(entry: FileEntry) {
		const folder = parentPath(entry.path);
		return folder === home ? 'Home' : folder.startsWith(`${home}/`) ? `~${folder.slice(home.length)}` : folder;
	}
</script>

{#snippet header()}
	<div class="list-grid list-header">
		{#each COLUMNS as column (column.sort)}
			{@const active = !recent && settings.value.sortBy === column.sort}
			<button
				class={['list-heading', column.class, active && 'is-active']}
				type="button"
				disabled={recent}
				onclick={() => manager.setSortBy(column.sort)}
			>
				<span class="truncate">{recent && column.sort === 'type' ? 'Location' : column.label}</span>
				{#if active}
					<Icon name={settings.value.sortAsc ? 'chevron-up' : 'chevron-down'} size={13} />
				{/if}
			</button>
		{/each}
	</div>
{/snippet}

{#snippet overlay()}
	{#if surface.marquee.box}
		<div class="selection-marquee" style={surface.marquee.style}></div>
	{/if}
{/snippet}

<VirtualScroller
	bind:this={surface.scroller}
	class="entry-scroller list-scroller soft-scroll"
	items={surface.items}
	key={(entry) => entry.path}
	layout={LAYOUT}
	overscan={8}
	stagger={view.motion.stagger}
	animateOrder={view.motion.reordering}
	{header}
	{overlay}
	role="listbox"
	aria-label="Files"
	aria-multiselectable="true"
	{...surface.pointerHandlers()}
>
	{#snippet children(entry)}
		<div class={[entryClasses(entry, context), 'list-grid list-row']} {...entryProps(entry, context)}>
			<span class="list-name">
				<EntryIcon name={entryIcon(entry)} size={24} {...thumbnailOf(entry)} />
				<EntryName {entry} {manager} class="truncate" />
				<VcsBadge status={vcs.statusFor(entry.path, entry.is_dir)} />
			</span>
			<span class="list-cell list-date">{formatDate(entry.modified)}</span>
			<span class="list-cell list-size">{entry.is_dir ? '' : formatBytes(entry.size)}</span>
			<span class="list-cell list-kind">{recent ? location(entry) : kindLabel(entry)}</span>
		</div>
	{/snippet}
</VirtualScroller>
