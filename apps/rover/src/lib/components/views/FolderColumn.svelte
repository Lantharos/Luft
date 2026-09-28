<script lang="ts">
	import { VirtualScroller } from '@luft/ui';
	import Icon from '$lib/components/Icon.svelte';
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import VcsBadge from '$lib/components/vcs/VcsBadge.svelte';
	import { thumbnailSource } from '$lib/file-manager/listing/thumbnails';
	import type { FolderColumnModel } from '$lib/file-manager/view/columns.svelte';
	import { entryClasses, entryContext, entryProps } from '$lib/file-manager/view/entry-props';
	import { EntrySurface } from '$lib/file-manager/view/surface.svelte';
	import type { FileEntry } from '$lib/types';
	import { entryIcon } from '$lib/utils/file-kinds';
	import EntryName from './EntryName.svelte';

	interface Props {
		column: FolderColumnModel;
		entries: FileEntry[];
	}

	let { column, entries }: Props = $props();

	const LAYOUT = { itemHeight: 30, gap: 1, padding: { top: 6, right: 6, bottom: 20, left: 6 } };
	const ENTER_WINDOW_MS = 150;

	const context = entryContext();
	const { manager, view, vcs } = context;
	const surface = new EntrySurface(context, () => entries);
	let entering = $state(true);
	let loaded = $derived(entries.length > 0);

	$effect(() => {
		if (column.current) return view.attach(surface.viewport);
	});

	$effect(() => {
		if (!loaded) return;
		const timer = setTimeout(() => (entering = false), ENTER_WINDOW_MS);
		return () => clearTimeout(timer);
	});

	function select(entry: FileEntry, event: MouseEvent) {
		if (column.current) return view.click(entry, event);
		void manager.navigate(column.path).then(() => {
			view.select([entry.path]);
			view.follow(entry.path);
		});
	}

	function classes(entry: FileEntry) {
		if (column.current) return entryClasses(entry, context);
		return ['entry', column.trail === entry.path && 'is-trail', entry.is_hidden && 'is-hidden-file'];
	}
</script>

<VirtualScroller
	bind:this={surface.scroller}
	class={['folder-column soft-scroll', column.current && 'is-current']}
	items={column.current ? surface.items : entries}
	key={(entry) => entry.path}
	layout={LAYOUT}
	overscan={6}
	stagger={entering}
	animateOrder={column.current && view.motion.reordering}
	role="listbox"
	aria-label={column.path}
	{...column.current ? surface.pointerHandlers() : {}}
>
	{#snippet children(entry)}
		<div class={[classes(entry), 'column-row']} {...entryProps(entry, context, select)}>
			<EntryIcon name={entryIcon(entry)} size={20} thumbnail={thumbnailSource(entry)} />
			<EntryName {entry} manager={manager} class="truncate" />
			<VcsBadge status={vcs.statusFor(entry.path, entry.is_dir)} />
			{#if entry.is_dir}
				<Icon name="chevron-right" size={14} class="column-chevron" />
			{/if}
		</div>
	{/snippet}
</VirtualScroller>
