<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import FilePreview from '$lib/components/preview/FilePreview.svelte';
	import { EntryDetails } from '$lib/file-manager/inspect/details.svelte';
	import { detailRows, tildePath, type DetailRow } from '$lib/file-manager/inspect/rows';
	import { thumbnailSource } from '$lib/file-manager/listing/thumbnails';
	import { entryContext } from '$lib/file-manager/view/entry-props';
	import type { FileEntry } from '$lib/types';
	import { entryIcon } from '$lib/utils/file-kinds';
	import { formatBytes, plural } from '$lib/utils/format';
	import { kindLabel } from '$lib/utils/kinds';
	import { basename, parentPath } from '$lib/utils/paths';
	import OpenWith from './OpenWith.svelte';

	const context = entryContext();
	const { manager, view, vcs } = context;

	const STACK_SIZE = 3;

	const inspected = new EntryDetails();
	let selected = $derived(manager.selectedEntries);
	let entry = $derived(selected.length === 1 ? selected[0] : null);
	let rows = $derived(
		entry
			? detailRows({ entry, details: inspected.details, media: inspected.media, vcs, home: manager.homePath, reveal })
			: []
	);
	let totalSize = $derived(selected.reduce((total, item) => total + (item.is_dir ? 0 : item.size), 0));
	let folderCount = $derived(selected.filter((item) => item.is_dir).length);
	let drive = $derived(manager.view === 'home' ? manager.drives.holding(manager.currentPath) : undefined);
	let folderTitle = $derived(
		manager.view === 'recent' ? 'Recent' : manager.currentPath === manager.homePath ? 'Home' : basename(manager.currentPath) || '/'
	);

	$effect(() => inspected.load(entry));

	function reveal(target: FileEntry) {
		const folder = parentPath(target.path);
		const select = () => view.select([target.path]);
		if (manager.view === 'home' && manager.currentPath === folder) return select();
		void manager.navigate(folder).then(select);
	}

	function appear(_node: Element) {
		return { duration: 200, easing: cubicOut, css: (t: number) => `opacity: ${t}; scale: ${0.985 + t * 0.015}` };
	}
</script>

{#snippet metadata(items: DetailRow[])}
	<dl class="details-rows">
		{#each items as row (row.label)}
			<div class="details-row">
				<dt>{row.label}</dt>
				{#if row.action}
					<dd><button class="details-link" type="button" onclick={row.action}>{row.value}</button></dd>
				{:else}
					<dd>{row.value}</dd>
				{/if}
			</div>
		{/each}
	</dl>
{/snippet}

<aside class="details-pane soft-scroll" aria-label="Details" transition:appear>
	{#if entry}
		<div class="details-preview">
			{#key entry.path}
				<FilePreview {entry} onmedia={inspected.receiveMedia} />
			{/key}
		</div>
		<div class="details-heading-block">
			<h2 class="details-title">{entry.name}</h2>
			<p class="details-subtitle">{inspected.details?.kind ?? kindLabel(entry)}</p>
		</div>
		{@render metadata(rows)}
		{#if !entry.is_dir && !context.chooser}
			<OpenWith apps={inspected.apps} path={entry.path} {manager} />
		{/if}
	{:else if selected.length > 1}
		<div class="details-preview details-stack">
			{#each selected.slice(0, STACK_SIZE) as item, index (item.path)}
				<span class="details-stack__item" style:--index={index}>
					<EntryIcon name={entryIcon(item)} size={88} thumbnail={thumbnailSource(item)} />
				</span>
			{/each}
		</div>
		<div class="details-heading-block">
			<h2 class="details-title">{plural(selected.length, 'item')}</h2>
			<p class="details-subtitle">
				{[folderCount && plural(folderCount, 'folder'), selected.length - folderCount && plural(selected.length - folderCount, 'file')]
					.filter(Boolean)
					.join(', ')}
			</p>
		</div>
		{@render metadata(totalSize > 0 ? [{ label: 'Size', value: formatBytes(totalSize) }] : [])}
	{:else}
		<div class="details-preview">
			<EntryIcon name={manager.view === 'recent' ? 'file' : 'folder'} size={96} />
		</div>
		<div class="details-heading-block">
			<h2 class="details-title">{folderTitle}</h2>
			<p class="details-subtitle">{plural(manager.displayEntries.length, 'item')}</p>
		</div>
		{@render metadata([
			...(manager.view === 'home' ? [{ label: 'Where', value: tildePath(manager.currentPath, manager.homePath) }] : []),
			...(drive ? [{ label: 'Free space', value: `${formatBytes(drive.available_space)} of ${formatBytes(drive.total_space)}` }] : [])
		])}
	{/if}
</aside>
