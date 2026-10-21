<script lang="ts">
	import { basename, bytes, plural } from '@luft/ui';
	import { cubicOut } from 'svelte/easing';
	import EntryIcon from '#lib/components/pane/EntryIcon.svelte';
	import FilePreview from '#lib/components/preview/FilePreview.svelte';
	import { EntryDetails } from '#lib/file-manager/inspect/details.svelte.js';
	import { detailRows, tildePath, type DetailRow } from '#lib/file-manager/inspect/rows.js';
	import { thumbnailOf } from '#lib/file-manager/listing/thumbnails.js';
	import { entryContext } from '#lib/file-manager/view/entry-props.js';
	import type { FileEntry } from '#lib/types/index.js';
	import { fileKind, kindLabel } from '#lib/utils/kinds.js';
	import { parentPath } from '#lib/utils/paths.js';
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
	let totalSize = $derived(selected.reduce((total, item) => total + (item.isDir ? 0 : item.size), 0));
	let folderCount = $derived(selected.filter((item) => item.isDir).length);
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
		{#if !entry.isDir && !context.chooser}
			<OpenWith apps={inspected.apps} path={entry.path} {manager} />
		{/if}
	{:else if selected.length > 1}
		<div class="details-preview details-stack">
			{#each selected.slice(0, STACK_SIZE) as item, index (item.path)}
				<span class="details-stack__item" style:--index={index}>
					<EntryIcon kind={fileKind(item)} size={88} {...thumbnailOf(item)} />
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
		{@render metadata(totalSize > 0 ? [{ label: 'Size', value: bytes(totalSize) }] : [])}
	{:else}
		<div class="details-preview">
			<EntryIcon kind={manager.view === 'recent' ? 'file' : 'folder'} size={96} />
		</div>
		<div class="details-heading-block">
			<h2 class="details-title">{folderTitle}</h2>
			<p class="details-subtitle">{plural(manager.displayEntries.length, 'item')}</p>
		</div>
		{@render metadata([
			...(manager.view === 'home' ? [{ label: 'Where', value: tildePath(manager.currentPath, manager.homePath) }] : []),
			...(drive ? [{ label: 'Free space', value: `${bytes(drive.availableSpace)} of ${bytes(drive.totalSpace)}` }] : [])
		])}
	{/if}
</aside>

<style>
	.details-pane {
		display: flex;
		width: 300px;
		min-height: 0;
		flex: none;
		flex-direction: column;
		gap: 18px;
		overflow-y: auto;
		padding: 16px 18px 24px;
		box-shadow: inset 1px 0 0 var(--hairline);
		transform-origin: right center;
	}

	.details-preview {
		position: relative;
		display: grid;
		height: 200px;
		flex: none;
		place-items: center;
		overflow: hidden;
		border-radius: 14px;
		background: var(--surface);
	}

	.details-stack__item {
		grid-area: 1 / 1;
		rotate: calc((var(--index) - 1) * 7deg);
		translate: calc((var(--index) - 1) * 26px) 0;
	}

	.details-heading-block {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.details-title {
		color: var(--text);
		font-size: 16px;
		font-weight: 500;
		line-height: 1.3;
		overflow-wrap: anywhere;
	}

	.details-subtitle {
		color: var(--text-muted);
		font-size: 13px;
	}

	.details-rows {
		display: flex;
		flex-direction: column;
		gap: 9px;
		font-size: 12.5px;
	}

	.details-row {
		display: grid;
		grid-template-columns: 84px minmax(0, 1fr);
		gap: 12px;
	}

	.details-row dt {
		color: var(--text-muted);
	}

	.details-row dd {
		min-width: 0;
		color: var(--text-soft);
		overflow-wrap: anywhere;
		user-select: text;
	}

	.details-link {
		text-align: left;
		color: var(--text-soft);
		transition: color var(--motion-tap) var(--ease-decelerate);
	}

	.details-link:hover {
		color: var(--accent);
	}
</style>
