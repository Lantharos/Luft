<script lang="ts">
	import { t } from '@luft/i18n';
	import { isInside, SearchField, selectionPill } from '@luft/ui';
	import type { ChooserState } from '#lib/file-manager/chooser.svelte.js';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import type { FileManager, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import type { TrashCounter } from '#lib/file-manager/places/places.svelte.js';
	import { rows } from '#lib/file-manager/places/sidebar.js';
	import CloudGroup from './CloudGroup.svelte';
	import DeviceItem from './DeviceItem.svelte';
	import DriveItem from './DriveItem.svelte';
	import NetworkItem from './NetworkItem.svelte';
	import SidebarList from './SidebarList.svelte';
	import WindowsItem from './WindowsItem.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		chooser: ChooserState | null;
		trash: TrashCounter;
	}

	let { manager, drag, chooser, trash }: Props = $props();

	let search = $state<SearchField>();

	let shownPaths = $derived(new Set(rows(manager.userDirs).flatMap((row) => (row.path ? [row.path] : []))));
	let activeDrive = $derived.by(() => {
		const path = manager.currentPath;
		if (manager.view !== 'home' || shownPaths.has(path) || isInside(path, manager.homePath) || manager.network.holding(path)) return null;
		return manager.drives.holding(path)?.mountPoint ?? null;
	});

	export function focusSearch() {
		search?.focus();
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
</script>

<aside class="glass-sidebar drag-region sidebar">
	<div class="sidebar-search">
		<SearchField bind:this={search} variant="sidebar" label={t('rover-sidebar-search')} bind:value={manager.searchQuery} />
	</div>

	<nav class="sidebar-scroll hidden-scroll scroll-fade" aria-label={t('rover-sidebar-places')} {@attach selectionPill('.sidebar-item.is-active')}>
		<SidebarList {manager} {drag} {chooser} {trash} onopentab={openInTab} onmenu={showMenu} />

		{#if manager.drives.ordered.length > 0 || manager.drives.windows.length > 0 || manager.network.devices.length > 0}
			<div class="flex flex-none flex-col gap-px">
				{#each manager.drives.ordered as drive (drive.mountPoint)}
					<DriveItem {drive} {manager} {drag} active={activeDrive === drive.mountPoint} onopentab={openInTab} onmenu={showMenu} />
				{/each}
				{#each manager.drives.windows as drive (drive.device)}
					<WindowsItem {drive} {manager} />
				{/each}
				{#each manager.network.devices as device (device.uri)}
					<DeviceItem {device} {manager} {drag} onopentab={openInTab} />
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
		padding: var(--sheet-inset);
	}

	.sidebar-search {
		padding-bottom: 12px;
	}

	.sidebar-scroll {
		display: flex;
		min-height: 0;
		flex: 1;
		flex-direction: column;
		gap: 12px;
		overflow-y: auto;
	}
</style>
