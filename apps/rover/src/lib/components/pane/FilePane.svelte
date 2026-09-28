<script lang="ts">
	import DriveGrid from '$lib/components/pane/DriveGrid.svelte';
	import EntryList from '$lib/components/pane/EntryList.svelte';
	import FavoritesList from '$lib/components/pane/FavoritesList.svelte';
	import TrashPane from '$lib/components/pane/TrashPane.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { ChooserState } from '$lib/file-manager/chooser.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { dropKey } from '$lib/file-manager/drag/drop-targets';
	import { Marquee } from '$lib/file-manager/listing/marquee.svelte';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		vcs: VcsState;
		chooser: ChooserState | null;
	}

	let { manager, drag, vcs, chooser }: Props = $props();
	let pane = $state<HTMLElement>();

	const marquee = new Marquee(
		() => pane,
		(paths) => (chooser ? chooser.selectRange(paths) : manager.replaceSelection(paths))
	);

	let paneKey = $derived(dropKey('pane', manager.currentPath));
	let listingEmpty = $derived(manager.displayEntries.length === 0 && !manager.draft);
</script>

{#snippet empty(icon: 'folder-open' | 'hard-drive' | 'star', message: string)}
	<div class="empty-pane">
		<Icon name={icon} size={42} />
		<p>{message}</p>
	</div>
{/snippet}

<section
	bind:this={pane}
	class="soft-scroll relative min-h-0 flex-1 overflow-auto px-5 pb-2"
	aria-label="File browser"
	tabindex="-1"
	data-drop-path={manager.view === 'home' ? manager.currentPath : undefined}
	data-drop-key={paneKey}
	onpointerdown={(event) => manager.view === 'home' && marquee.start(event, manager.selection)}
	onpointermove={marquee.move}
	onpointerup={marquee.end}
	onpointercancel={marquee.end}
	onscroll={marquee.scroll}
	oncontextmenu={(event) => (chooser ? event.preventDefault() : manager.openContextMenu(event))}
	ondragover={(event) => (chooser ? event.preventDefault() : drag.overEntry(event, undefined, paneKey))}
	ondrop={(event) => !chooser && drag.drop(event, manager.currentPath)}
>
	{#if marquee.box}
		<div class="selection-marquee" style={marquee.style}></div>
	{/if}

	{#if manager.loading.skeleton}
		<div class="loading-skeleton grid gap-2 pt-2">
			{#each Array.from({ length: 9 }, (_, index) => index) as index (index)}
				<div class="h-11 rounded-full bg-[var(--surface-soft)]" style:opacity={0.36 + index * 0.04}></div>
			{/each}
		</div>
	{:else if manager.error}
		<div class="flex h-full items-center justify-center text-[var(--danger)]">
			<div class="flex max-w-[520px] items-center gap-3 px-4 py-3 text-[14px]">
				<Icon name="alert-circle" size={18} />
				<span class="text-pretty">{manager.error}</span>
			</div>
		</div>
	{:else if manager.view === 'drives'}
		{#if manager.drives.list.length === 0}
			{@render empty('hard-drive', 'No drives mounted')}
		{:else}
			<DriveGrid {manager} {drag} />
		{/if}
	{:else if manager.view === 'trash'}
		<TrashPane {manager} />
	{:else if manager.view === 'favorites'}
		{#if settings.value.favorites.length === 0}
			{@render empty('star', 'No favorites yet')}
		{:else}
			<FavoritesList
				favorites={settings.value.favorites}
				onOpen={(favorite) => (chooser ? chooser.openFavorite(favorite) : manager.openEntry(favorite))}
			/>
		{/if}
	{:else if listingEmpty}
		{@render empty('folder-open', manager.searchQuery ? 'Nothing matches your search' : 'This folder is empty')}
	{:else}
		<EntryList {manager} {drag} {vcs} {chooser} />
	{/if}
</section>

<style>
	.loading-skeleton {
		animation: skeleton-enter 180ms cubic-bezier(0.2, 0, 0, 1) both;
	}

	@keyframes skeleton-enter {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
