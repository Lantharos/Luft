<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import Trash from '@lucide/svelte/icons/trash';
	import { isInside, SearchField, selectionPill } from '@luft/ui';
	import { folderLooks } from '#lib/features/looks/looks.svelte.js';
	import type { ChooserState } from '#lib/file-manager/chooser.svelte.js';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey, TRASH_DROP_PATH } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import { mainPlaces, type TrashCounter } from '#lib/file-manager/places/places.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import CloudGroup from './CloudGroup.svelte';
	import DriveItem from './DriveItem.svelte';
	import FavoritesGroup from './FavoritesGroup.svelte';
	import NetworkItem from './NetworkItem.svelte';
	import SidebarItem from './SidebarItem.svelte';
	import WindowsItem from './WindowsItem.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		chooser: ChooserState | null;
		trash: TrashCounter;
	}

	let { manager, drag, chooser, trash }: Props = $props();

	let search = $state<SearchField>();

	let hidden = $derived(new Set(settings.value.hiddenPlaces));
	let places = $derived(mainPlaces(manager.userDirs));
	let shown = $derived(places.filter((place) => !hidden.has(place.path)));
	let home = $derived(shown.find((place) => place.path === manager.homePath));
	let folders = $derived(shown.filter((place) => place !== home));
	let placePaths = $derived(new Set(shown.map((place) => place.path)));
	let browsing = $derived(manager.view === 'home');
	let activeDrive = $derived.by(() => {
		const path = manager.currentPath;
		if (!browsing || placePaths.has(path) || isInside(path, manager.homePath) || manager.network.holding(path)) return null;
		return manager.drives.holding(path)?.mountPoint ?? null;
	});

	$effect(() => {
		const favorites = settings.value.pinnedFolders.filter((bookmark) => bookmark.isDir).map((bookmark) => bookmark.path);
		void folderLooks.keep([...places.map((place) => place.path), ...favorites]);
	});

	export function focusSearch() {
		search?.focus();
	}

	function key(path: string) {
		return dropKey('sidebar', path);
	}

	function openInTab(event: MouseEvent, open: () => void) {
		if (event.button !== 1) return;
		event.preventDefault();
		event.stopPropagation();
		open();
	}

	function showMenu(event: MouseEvent, place: SidebarPlace) {
		if (chooser) event.preventDefault();
		else manager.openPlaceMenu(event, place);
	}

	function folderItem(path: string) {
		return {
			...folderLooks.art(path),
			oncontextmenu: (event: MouseEvent) => showMenu(event, { kind: 'folder', path }),
			active: browsing && manager.currentPath === path,
			dropping: drag.target?.key === key(path),
			onclick: () => manager.navigate(path),
			onauxclick: (event: MouseEvent) => openInTab(event, () => manager.openTab(path)),
			ondragover: (event: DragEvent) => drag.overPath(event, path, key(path)),
			ondragleave: drag.leave,
			ondrop: (event: DragEvent) => drag.drop(event, path)
		};
	}
</script>

<aside class="glass-sidebar drag-region sidebar">
	<div class="sidebar-search">
		<SearchField bind:this={search} variant="sidebar" label="Search current folder" bind:value={manager.searchQuery} />
	</div>

	<nav class="sidebar-scroll hidden-scroll scroll-fade" aria-label="Places" {@attach selectionPill('.sidebar-item.is-active')}>
		<div class="flex flex-none flex-col gap-px">
			{#if home}
				<SidebarItem label={home.label} {...folderItem(home.path)} />
			{/if}
			<SidebarItem
				icon={Clock}
				label="Recent"
				active={manager.view === 'recent'}
				onclick={() => manager.showView('recent')}
				onauxclick={(event) => openInTab(event, () => manager.openViewInTab('recent'))}
				oncontextmenu={(event) => showMenu(event, { kind: 'recent' })}
			/>
			{#each folders as folder (folder.path)}
				<SidebarItem label={folder.label} {...folderItem(folder.path)} />
			{/each}
			{#if !chooser}
				<SidebarItem
					icon={Trash}
					label="Trash"
					active={manager.view === 'trash'}
					dropping={drag.target?.key === key(TRASH_DROP_PATH)}
					onclick={() => manager.showView('trash')}
					onauxclick={(event) => openInTab(event, () => manager.openViewInTab('trash'))}
					oncontextmenu={(event) => showMenu(event, { kind: 'trash' })}
					ondragover={(event) => drag.overTrash(event, key(TRASH_DROP_PATH))}
					ondragleave={drag.leave}
					ondrop={(event) => drag.dropOnTrash(event)}
				>
					{#snippet trailing()}
						{#if trash.count > 0}
							<span class="sidebar-item__count">{trash.count}</span>
						{/if}
					{/snippet}
				</SidebarItem>
			{/if}
		</div>

		<FavoritesGroup {manager} {drag} {chooser} hidden={placePaths} onopentab={openInTab} onmenu={showMenu} />

		{#if manager.drives.ordered.length > 0 || manager.drives.windows.length > 0}
			<div class="flex flex-none flex-col gap-px">
				{#each manager.drives.ordered as drive (drive.mountPoint)}
					<DriveItem {drive} {manager} {drag} active={activeDrive === drive.mountPoint} onopentab={openInTab} onmenu={showMenu} />
				{/each}
				{#each manager.drives.windows as drive (drive.device)}
					<WindowsItem {drive} {manager} />
				{/each}
			</div>
		{/if}

		{#if manager.cloud.available && (manager.cloud.drives.length > 0 || !chooser)}
			<CloudGroup {manager} {drag} adding={!chooser} onopentab={openInTab} />
		{/if}

		{#if manager.network.entries.length > 0}
			<div class="flex flex-none flex-col gap-px">
				{#each manager.network.entries as entry (entry.place.uri)}
					<NetworkItem {entry} {manager} {drag} onopentab={openInTab} onmenu={showMenu} />
				{/each}
			</div>
		{/if}
	</nav>
</aside>

<style>
	.sidebar {
		padding: 12px 10px 12px;
	}

	.sidebar-search {
		padding: 2px 2px 12px;
	}

	.sidebar-scroll {
		display: flex;
		min-height: 0;
		flex: 1;
		flex-direction: column;
		gap: 12px;
		overflow-y: auto;
	}

	.sidebar-item__count {
		margin-right: 14px;
		color: var(--sidebar-text-muted);
		font-size: 12px;
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}
</style>
