<script lang="ts">
	import { SearchField } from '@luft/ui';
	import type { ChooserState } from '#lib/file-manager/chooser.svelte.js';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey, TRASH_DROP_PATH } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import { userFolders, type TrashCounter } from '#lib/file-manager/places/places.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import { isInside } from '#lib/utils/paths.js';
	import DriveItem from './DriveItem.svelte';
	import FavoritesGroup from './FavoritesGroup.svelte';
	import NetworkItem from './NetworkItem.svelte';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		chooser: ChooserState | null;
		trash: TrashCounter;
	}

	let { manager, drag, chooser, trash }: Props = $props();

	let search = $state<SearchField>();

	let hidden = $derived(new Set(settings.value.hiddenPlaces));
	let folders = $derived(userFolders(manager.userDirs).filter((folder) => !hidden.has(folder.path)));
	let showHome = $derived(!hidden.has(manager.homePath));
	let placePaths = $derived(new Set([...(showHome ? [manager.homePath] : []), ...folders.map((folder) => folder.path)]));
	let browsing = $derived(manager.view === 'home');
	let activeDrive = $derived.by(() => {
		const path = manager.currentPath;
		if (!browsing || placePaths.has(path) || isInside(path, manager.homePath) || manager.network.holding(path)) return null;
		return manager.drives.holding(path)?.mount_point ?? null;
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
			oncontextmenu: (event: MouseEvent) => showMenu(event, { kind: 'folder', path }),
			active: browsing && manager.currentPath === path,
			dropping: drag.target?.key === key(path),
			onclick: () => manager.navigate(path),
			onauxclick: (event: MouseEvent) => openInTab(event, () => manager.openTab(path)),
			ondragover: (event: DragEvent) => drag.overPath(event, path, key(path)),
			ondragleave: drag.leave,
			ondrop: (event: DragEvent) => drag.drop(event, path),
			'data-drop-path': path,
			'data-drop-key': key(path)
		};
	}
</script>

<aside class="glass-sidebar drag-region sidebar">
	<div class="sidebar-search">
		<SearchField bind:this={search} variant="sidebar" label="Search current folder" bind:value={manager.searchQuery} />
	</div>

	<nav class="sidebar-scroll hidden-scroll scroll-fade" aria-label="Places">
		<div class="sidebar-group">
			{#if showHome}
				<SidebarItem icon="home" label="Home" {...folderItem(manager.homePath)} />
			{/if}
			<SidebarItem
				icon="clock"
				label="Recent"
				active={manager.view === 'recent'}
				onclick={() => manager.showView('recent')}
				onauxclick={(event) => openInTab(event, () => manager.openViewInTab('recent'))}
				oncontextmenu={(event) => showMenu(event, { kind: 'recent' })}
			/>
			{#each folders as folder (folder.path)}
				<SidebarItem icon={folder.icon} label={folder.label} {...folderItem(folder.path)} />
			{/each}
			{#if !chooser}
				<SidebarItem
					icon="trash"
					label="Trash"
					active={manager.view === 'trash'}
					dropping={drag.target?.key === key(TRASH_DROP_PATH)}
					onclick={() => manager.showView('trash')}
					onauxclick={(event) => openInTab(event, () => manager.openViewInTab('trash'))}
					oncontextmenu={(event) => showMenu(event, { kind: 'trash' })}
					ondragover={(event) => drag.overTrash(event, key(TRASH_DROP_PATH))}
					ondragleave={drag.leave}
					ondrop={(event) => drag.dropOnTrash(event)}
					data-drop-key={key(TRASH_DROP_PATH)}
					data-drop-trash=""
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

		{#if manager.drives.ordered.length > 0}
			<div class="sidebar-group">
				{#each manager.drives.ordered as drive (drive.mount_point)}
					<DriveItem {drive} {manager} {drag} active={activeDrive === drive.mount_point} onopentab={openInTab} onmenu={showMenu} />
				{/each}
			</div>
		{/if}

		{#if manager.network.entries.length > 0}
			<div class="sidebar-group">
				{#each manager.network.entries as entry (entry.place.uri)}
					<NetworkItem {entry} {manager} {drag} onopentab={openInTab} onmenu={showMenu} />
				{/each}
			</div>
		{/if}
	</nav>
</aside>
