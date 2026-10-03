<script lang="ts">
	import { chrome } from '#lib/app/chrome.svelte.js';
	import PageThumbnails from '#lib/document/PageThumbnails.svelte';
	import { documentState } from '#lib/document/state.svelte.js';
	import { plural } from '#lib/library/format.js';
	import { library } from '#lib/library/library.svelte.js';
	import { folderTitle } from '#lib/library/places.js';
	import { player } from '#lib/music/player.svelte.js';
	import QueueList from '#lib/music/QueueList.svelte';
	import FolderGrid from './FolderGrid.svelte';
	import Places from './Places.svelte';

	let open = $derived(chrome.sidebar && !chrome.fullscreen);
	let title = $derived(library.group === 'audio' ? 'Queue' : library.group === 'document' ? 'Pages' : library.folder ? folderTitle(library.folder, library.places) : '');
	let summary = $derived.by(() => {
		if (library.group === 'audio') return plural(player.queue.length, 'song', 'songs');
		if (library.group === 'document') return documentState.pages ? plural(documentState.pages, 'page', 'pages') : '';
		if (library.group === 'font') return plural(library.siblings.length, 'font', 'fonts');
		const photos = library.siblings.filter((item) => item.kind === 'image').length;
		const videos = library.siblings.length - photos;
		if (!videos) return plural(photos, 'photo', 'photos');
		if (!photos) return plural(videos, 'video', 'videos');
		return `${plural(photos, 'photo', 'photos')}, ${plural(videos, 'video', 'videos')}`;
	});
</script>

<aside class="glass-sidebar sidebar" class:collapsed={!open} aria-hidden={!open} inert={!open}>
	<div class="inner drag-region">
		<div class="flex-none p-3">
			<Places />
		</div>
		{#if library.current}
			<header class="flex-none px-5 pt-2 pb-2">
				<p class="truncate text-[13px] font-semibold text-[var(--text)]">{title}</p>
				<p class="truncate text-[12px] text-[var(--sidebar-text-muted)]">{summary}</p>
			</header>
			{#if library.group === 'visual' || library.group === 'font'}
				<FolderGrid />
			{:else if library.group === 'audio'}
				<QueueList />
			{:else if library.group === 'document'}
				<PageThumbnails />
			{/if}
		{/if}
	</div>
</aside>

<style>
	.sidebar {
		overflow: hidden;
		transition: width 240ms var(--ease);
	}

	.sidebar.collapsed {
		width: 0;
	}

	.inner {
		display: flex;
		height: 100%;
		width: var(--sidebar-width);
		flex-direction: column;
	}
</style>
