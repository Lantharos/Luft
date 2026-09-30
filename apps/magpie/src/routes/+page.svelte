<script lang="ts">
	import { onMount } from 'svelte';
	import { events as sabineEvents, type WindowFileDragEvent } from '@lantharos/sabine';
	import { appearance, GlassShell } from '@luft/ui';
	import type { Activation } from '$lib/api';
	import * as api from '$lib/api';
	import { openPaths } from '$lib/app/actions';
	import { chrome } from '$lib/app/chrome.svelte';
	import { handleKeydown } from '$lib/app/keyboard';
	import { isDesktop } from '$lib/bridge';
	import Gallery from '$lib/browse/Gallery.svelte';
	import Sidebar from '$lib/browse/Sidebar.svelte';
	import DocumentActions from '$lib/document/DocumentActions.svelte';
	import DocumentView from '$lib/document/DocumentView.svelte';
	import PageThumbnails from '$lib/document/PageThumbnails.svelte';
	import { documentState } from '$lib/document/state.svelte';
	import { plural } from '$lib/library/format';
	import { library } from '$lib/library/library.svelte';
	import { folderTitle } from '$lib/library/places';
	import { thumbnails } from '$lib/library/thumbnails.svelte';
	import MusicView from '$lib/music/MusicView.svelte';
	import NowPlaying from '$lib/music/NowPlaying.svelte';
	import { player } from '$lib/music/player.svelte';
	import { trackTitle } from '$lib/music/queue';
	import QueueList from '$lib/music/QueueList.svelte';
	import PhotoActions from '$lib/photo/PhotoActions.svelte';
	import { slideshow } from '$lib/photo/slideshow.svelte';
	import { mediaSession } from '$lib/playback/session';
	import { volume } from '$lib/playback/volume.svelte';
	import Header from '$lib/shell/Header.svelte';
	import MoreMenu from '$lib/shell/MoreMenu.svelte';
	import PanelToggle from '$lib/shell/PanelToggle.svelte';
	import SidePanel from '$lib/shell/SidePanel.svelte';
	import Toast from '$lib/shell/Toast.svelte';
	import VisualStage from '$lib/shell/VisualStage.svelte';
	import Welcome from '$lib/shell/Welcome.svelte';

	let item = $derived(library.current);
	let viewer = $derived(chrome.mode === 'viewer');
	let immersive = $derived(chrome.fullscreen || slideshow.running || chrome.watching);
	let browsing = $derived(!item && chrome.mode === 'library' && library.folder !== null);
	let title = $derived.by(() => {
		if (library.group === 'audio' && player.track) return player.track.album ?? trackTitle(player.track);
		if (browsing) return folderTitle(library.folder!, library.places);
		return item?.name ?? 'Magpie';
	});
	let subtitle = $derived.by(() => {
		if (browsing) return library.items.length ? plural(library.items.length, 'item', 'items') : null;
		if (library.group === 'audio') return player.queue.length > 1 ? `${player.position + 1} of ${player.queue.length}` : null;
		if (library.group === 'document') return documentState.pages ? `Page ${documentState.page} of ${documentState.pages}` : null;
		if (library.group === 'visual' && library.siblings.length > 1) return `${library.index + 1} of ${library.siblings.length}`;
		return null;
	});

	onMount(() => {
		volume.start();
		chrome.wake();
		const stops = [
			api.events.folder(library.receive),
			api.events.thumbnails(thumbnails.receive),
			api.events.media(mediaSession.receive),
			api.events.activation((activation) => void activate(activation)),
			isDesktop() ? sabineEvents.fileDrag(drop) : () => {}
		];
		void start();
		return () => stops.forEach((stop) => stop());
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	async function start() {
		const state = await api.appState();
		if (isDesktop()) appearance.start(state);
		chrome.start(state.launchPaths.length ? 'viewer' : 'library');
		if (viewer) return openPaths(state.launchPaths);
		library.places = await api.places();
		if (library.places[0]) await library.browse(library.places[0].path);
	}

	async function activate(activation: Activation) {
		await openPaths(await api.resolveArguments(activation));
	}

	function drop(event: WindowFileDragEvent) {
		if (event.phase === 'drop' && !event.internal) void openPaths(event.paths);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="h-[100dvh] w-screen overflow-hidden">
	<GlassShell class={['h-full select-none', chrome.fullscreen && 'fullscreen']}>
		{#if !viewer}
			<Sidebar />
		{/if}
		<main
			class={[
				'glass-content relative isolate',
				library.group === 'visual' && 'stage',
				chrome.seeThrough && 'see-through',
				chrome.idle && 'idle',
				immersive && 'immersive'
			]}
		>
			<Header {title} {subtitle} overlay={chrome.fullscreen}>
				{#snippet actions()}
					<NowPlaying />
					{#if viewer && library.group}
						<PanelToggle group={library.group} />
					{/if}
					{#if item?.kind === 'image'}
						<PhotoActions />
					{:else if library.group === 'document'}
						<DocumentActions />
					{:else if item}
						<MoreMenu />
					{/if}
				{/snippet}
			</Header>
			<div class="relative flex min-h-0 flex-1">
				{#if item && library.group === 'visual'}
					<VisualStage {item} />
				{:else if item && library.group === 'audio'}
					{#if viewer && chrome.panel}
						<SidePanel label="Queue"><QueueList /></SidePanel>
					{/if}
					<div class="min-w-0 flex-1"><MusicView {item} /></div>
				{:else if item && library.group === 'document'}
					{#if viewer && chrome.panel}
						<SidePanel label="Pages"><PageThumbnails /></SidePanel>
					{/if}
					<div class="relative min-w-0 flex-1">
						{#key item.path}
							<DocumentView {item} />
						{/key}
					</div>
				{:else if browsing}
					<div class="flex min-w-0 flex-1 flex-col"><Gallery /></div>
				{:else}
					<div class="min-w-0 flex-1"><Welcome /></div>
				{/if}
			</div>
			<Toast />
		</main>
	</GlassShell>
</div>
