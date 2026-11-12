<script lang="ts">
	import { onMount } from 'svelte';
	import { appWindow, events as sabineEvents, type SingleInstanceEvent } from '@lantharos/sabine';
	import { appearance, fileDrop, GlassShell, plural, Toast } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import { openPaths } from '#lib/app/actions.js';
	import { chrome } from '#lib/app/chrome.svelte.js';
	import { handleKeydown } from '#lib/app/keyboard.js';
	import { keepShown, reopen, type Shown } from '#lib/app/reopen.js';
	import Gallery from '#lib/browse/Gallery.svelte';
	import Sidebar from '#lib/browse/Sidebar.svelte';
	import DocumentActions from '#lib/document/DocumentActions.svelte';
	import DocumentView from '#lib/document/DocumentView.svelte';
	import PageThumbnails from '#lib/document/PageThumbnails.svelte';
	import { documentState } from '#lib/document/state.svelte.js';
	import FontActions from '#lib/font/FontActions.svelte';
	import FontView from '#lib/font/FontView.svelte';
	import { library } from '#lib/library/library.svelte.js';
	import { folderTitle } from '#lib/library/places.js';
	import { thumbnails } from '#lib/library/thumbnails.svelte.js';
	import MusicActions from '#lib/music/MusicActions.svelte';
	import MusicView from '#lib/music/MusicView.svelte';
	import NowPlaying from '#lib/music/NowPlaying.svelte';
	import { player } from '#lib/music/player.svelte.js';
	import { trackTitle } from '#lib/music/queue.js';
	import QueueList from '#lib/music/QueueList.svelte';
	import { visualizer } from '#lib/music/visualizer/settings.svelte.js';
	import Visualizer from '#lib/music/visualizer/Visualizer.svelte';
	import PhotoActions from '#lib/photo/PhotoActions.svelte';
	import { slideshow } from '#lib/photo/slideshow.svelte.js';
	import { mediaSession } from '#lib/playback/session.js';
	import { volume } from '#lib/playback/volume.svelte.js';
	import Header from '#lib/shell/Header.svelte';
	import MoreMenu from '#lib/shell/MoreMenu.svelte';
	import PanelToggle from '#lib/shell/PanelToggle.svelte';
	import SidePanel from '#lib/shell/SidePanel.svelte';
	import VisualStage from '#lib/shell/VisualStage.svelte';
	import Welcome from '#lib/shell/Welcome.svelte';

	let item = $derived(library.current);
	let viewer = $derived(chrome.mode === 'viewer');
	let immersive = $derived(chrome.fullscreen || slideshow.running || chrome.watching);
	let listening = $derived(library.group === 'audio' && chrome.fullscreen);
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
		if ((library.group === 'visual' || library.group === 'font') && library.siblings.length > 1) return `${library.index + 1} of ${library.siblings.length}`;
		return null;
	});

	onMount(() => {
		volume.start();
		visualizer.start();
		chrome.wake();
		const stops = [
			events.magpieFolder(library.receive),
			events.magpieThumbnails(thumbnails.receive),
			events.magpieMedia(mediaSession.receive),
			sabineEvents.singleInstance((activation) => void activate(activation))
		];
		void start();
		return () => stops.forEach((stop) => stop());
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	async function start() {
		const [state, shown] = await Promise.all([commands.appState(), appWindow.restoredState<Shown>()]);
		appearance.start(state);
		chrome.start();
		await (shown && !state.launchPaths.length ? reopen(shown) : show(state.launchPaths));
		keepShown();
	}

	async function show(paths: string[]) {
		chrome.mode = paths.length ? 'viewer' : 'library';
		if (paths.length) return openPaths(paths);
		if (!library.places.length) library.places = await commands.places();
		if (library.folder === null && library.places[0]) await library.browse(library.places[0].path);
	}

	async function activate(activation: SingleInstanceEvent) {
		await show(await commands.resolveArguments(activation));
	}

	const drop = fileDrop((paths) => void openPaths(paths));
</script>

<svelte:window onkeydown={handleKeydown} ondragover={drop.ondragover} ondrop={drop.ondrop} />

<div class="h-[100dvh] w-screen overflow-hidden">
	<GlassShell class="h-full select-none">
		{#if !viewer}
			<Sidebar />
		{/if}
		<main
			class={[
				'glass-content relative isolate',
				(library.group === 'visual' || listening) && 'stage',
				chrome.seeThrough && 'see-through',
				chrome.idle && 'idle',
				immersive && 'immersive'
			]}
		>
			{#if item && library.group === 'audio' && visualizer.on}
				<Visualizer />
			{/if}
			<Header {title} {subtitle} overlay={chrome.fullscreen}>
				{#snippet actions()}
					<NowPlaying />
					{#if viewer && library.group && library.group !== 'font' && !listening}
						<PanelToggle group={library.group} />
					{/if}
					{#if item?.kind === 'image'}
						<PhotoActions />
					{:else if library.group === 'document'}
						<DocumentActions />
					{:else if library.group === 'font'}
						<FontActions />
					{:else if library.group === 'audio'}
						<MusicActions />
					{:else if item}
						<MoreMenu />
					{/if}
				{/snippet}
			</Header>
			<div class="relative flex min-h-0 flex-1">
				{#if item && library.group === 'visual'}
					<VisualStage {item} />
				{:else if item && library.group === 'audio'}
					{#if viewer && chrome.panel && !listening}
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
				{:else if item && library.group === 'font'}
					<div class="min-w-0 flex-1"><FontView {item} /></div>
				{:else if browsing}
					<div class="flex min-w-0 flex-1 flex-col"><Gallery /></div>
				{:else}
					<div class="min-w-0 flex-1"><Welcome /></div>
				{/if}
			</div>
			<Toast
				class="absolute z-40"
				toast={chrome.toasts.current}
				ondismiss={chrome.toasts.dismiss}
				onhold={chrome.toasts.hold}
				onrelease={chrome.toasts.release}
			/>
		</main>
	</GlassShell>
</div>
