<script lang="ts">
	import { VirtualScroller } from '@luft/ui';
	import FileText from '@lucide/svelte/icons/file-text';
	import Folder from '@lucide/svelte/icons/folder';
	import Music from '@lucide/svelte/icons/music';
	import Play from '@lucide/svelte/icons/play';
	import type { Folder as FolderEntry, Item } from '#lib/bridge/api.js';
	import FontSample from '#lib/font/FontSample.svelte';
	import { library } from '#lib/library/library.svelte.js';
	import { thumbnails } from '#lib/library/thumbnails.svelte.js';

	type Entry = { type: 'folder'; folder: FolderEntry } | { type: 'item'; item: Item };

	const LAYOUT = { itemHeight: 196, minItemWidth: 168, gap: 14, padding: { top: 8, right: 24, bottom: 32, left: 24 } };

	let entries = $derived<Entry[]>([
		...library.folders.map((folder) => ({ type: 'folder' as const, folder })),
		...library.items.map((item) => ({ type: 'item' as const, item }))
	]);

	function key(entry: Entry) {
		return entry.type === 'folder' ? `folder:${entry.folder.path}` : entry.item.path;
	}
</script>

{#if entries.length}
	<VirtualScroller class="soft-scroll min-h-0 flex-1" items={entries} {key} layout={LAYOUT}>
		{#snippet children(entry)}
			{#if entry.type === 'folder'}
				<button type="button" class="entry" onclick={() => library.browse(entry.folder.path)}>
					<span class="cover folder"><Folder size={42} strokeWidth={1.5} /></span>
					<span class="name">{entry.folder.name}</span>
				</button>
			{:else}
				{@const thumbnail = thumbnails.source(entry.item)}
				<button type="button" class="entry" onclick={() => library.select(entry.item)}>
					<span class="cover">
						{#if thumbnail}
							<img src={thumbnail} alt="" draggable="false" decoding="async" />
						{:else if entry.item.kind === 'audio'}
							<Music size={36} strokeWidth={1.5} />
						{:else if entry.item.kind === 'document'}
							<FileText size={36} strokeWidth={1.5} />
						{:else if entry.item.kind === 'font'}
							<FontSample path={entry.item.path} />
						{/if}
						{#if entry.item.kind === 'video'}
							<span class="video"><Play size={12} fill="currentColor" /></span>
						{/if}
					</span>
					<span class="name">{entry.item.name}</span>
				</button>
			{/if}
		{/snippet}
	</VirtualScroller>
{:else}
	<div class="grid flex-1 place-items-center text-[14px] text-[var(--text-muted)]">There's nothing here to look at.</div>
{/if}

<style>
	.entry {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		gap: 8px;
		border-radius: 14px;
		text-align: left;
	}

	.cover {
		position: relative;
		display: grid;
		min-height: 0;
		width: 100%;
		flex: 1;
		place-items: center;
		overflow: hidden;
		border-radius: 14px;
		background: var(--surface-hover);
		color: var(--text-muted);
		transition: transform 180ms var(--ease);
	}

	.entry:hover .cover {
		transform: scale(0.975);
	}

	.folder {
		color: var(--accent);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		animation: reveal 200ms var(--ease);
	}

	.name {
		overflow: hidden;
		padding-inline: 4px;
		font-size: 13px;
		color: var(--text-soft);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.video {
		position: absolute;
		right: 8px;
		bottom: 8px;
		display: grid;
		height: 24px;
		width: 24px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
	}

	@keyframes reveal {
		from {
			opacity: 0;
		}
	}
</style>
