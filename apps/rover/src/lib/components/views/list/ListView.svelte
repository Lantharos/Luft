<script lang="ts">
	import { bytes, parent, plural, relativeDay, VirtualScroller } from '@luft/ui';
	import type { Attachment } from 'svelte/attachments';
	import EntryIcon from '#lib/components/pane/EntryIcon.svelte';
	import CloudMark from '#lib/components/cloud/CloudMark.svelte';
	import VcsBadge from '#lib/components/vcs/VcsBadge.svelte';
	import { folderCounts } from '#lib/features/onscreen/folder-counts.svelte.js';
	import { thumbnailOf } from '#lib/file-manager/listing/thumbnails.js';
	import { DRAFT_PATH } from '#lib/file-manager/view/draft.js';
	import { entryClasses, entryContext, entryProps } from '#lib/file-manager/view/entry-props.js';
	import { ListColumns } from '#lib/file-manager/view/list-columns.svelte.js';
	import { EntrySurface, isGroupRow } from '#lib/file-manager/view/surface.svelte.js';
	import type { FileEntry, ListColumnId } from '#lib/types/index.js';
	import { fileKind, kindLabel } from '#lib/utils/kinds.js';
	import EntryName from '../EntryName.svelte';
	import ColumnsMenu from './ColumnsMenu.svelte';
	import ListHeader from './ListHeader.svelte';

	const LAYOUT = { itemHeight: 34, gap: 2, padding: { top: 2, right: 10, bottom: 24, left: 10 } };

	const context = entryContext();
	const { manager, view, vcs } = context;
	const surface = new EntrySurface(context, undefined, () => manager.sections);
	const columns = new ListColumns();

	let recent = $derived(manager.view === 'recent');
	let home = $derived(manager.homePath);
	let menu = $state<{ x: number; y: number } | null>(null);

	$effect(() => view.attach(surface.viewport));

	const measure: Attachment<HTMLElement> = (node) => {
		const observer = new ResizeObserver(([entry]) => (columns.width = entry.contentRect.width));
		observer.observe(node);
		return () => observer.disconnect();
	};

	function location(entry: FileEntry) {
		const folder = parent(entry.path);
		return folder === home ? 'Home' : folder.startsWith(`${home}/`) ? `~${folder.slice(home.length)}` : folder;
	}

	function size(entry: FileEntry) {
		if (!entry.isDir) return bytes(entry.size);
		const count = entry.path === DRAFT_PATH ? null : folderCounts.count(entry);
		return count === null ? '' : plural(count, 'item');
	}

	function cell(entry: FileEntry, id: ListColumnId) {
		if (id === 'date') return entry.modified ? relativeDay(entry.modified) : '';
		if (id === 'size') return size(entry);
		return recent ? location(entry) : kindLabel(entry);
	}

	function openMenu(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		manager.closeMenus();
		menu = { x: event.clientX, y: event.clientY };
	}
</script>

{#snippet header()}
	<ListHeader {manager} {columns} {recent} onmenu={openMenu} />
{/snippet}

{#snippet overlay()}
	{#if surface.marquee.box}
		<div class="selection-marquee" style={surface.marquee.style}></div>
	{/if}
{/snippet}

<VirtualScroller
	bind:this={surface.scroller}
	class="entry-scroller list-scroller soft-scroll"
	style="--list-columns: {columns.template}"
	items={surface.rows}
	key={(row) => (isGroupRow(row) ? `\u0000group:${row.group}` : row.path)}
	layout={LAYOUT}
	overscan={8}
	stagger={view.motion.stagger}
	animateOrder={view.motion.reordering}
	{header}
	{overlay}
	role="listbox"
	aria-label="Files"
	aria-multiselectable="true"
	{@attach measure}
	{...surface.pointerHandlers()}
>
	{#snippet children(row)}
		{#if isGroupRow(row)}
			<div class="list-group" role="presentation">
				<span class="truncate">{row.label}</span>
				<span class="list-group__count">{row.count}</span>
			</div>
		{:else}
			<div class={[entryClasses(row, context), 'list-grid list-row']} {...entryProps(row, context)}>
				<span class="list-name">
					<EntryIcon kind={fileKind(row)} size={24} {...thumbnailOf(row)} />
					<EntryName entry={row} {manager} class="truncate" />
					<CloudMark state={manager.cloud.stateOf(row.path)} />
					<VcsBadge status={vcs.statusFor(row.path, row.isDir)} />
				</span>
				{#each columns.shown as column (column.id)}
					<span class={['list-cell', `list-${column.id}`]}>{cell(row, column.id)}</span>
				{/each}
			</div>
		{/if}
	{/snippet}
</VirtualScroller>

{#if menu}
	<ColumnsMenu at={menu} {columns} {recent} onclose={() => (menu = null)} />
{/if}

<style>
	.list-group {
		display: flex;
		height: 100%;
		align-items: flex-end;
		gap: 8px;
		padding: 0 10px 7px;
		color: var(--text-soft);
		font-size: 12.5px;
		font-weight: 500;
	}

	.list-group__count {
		color: var(--text-muted);
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}
</style>
