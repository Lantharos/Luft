<script lang="ts">
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import { showPathProperties } from '$lib/features/actions';
	import * as bookmarks from '$lib/file-manager/places/bookmarks';
	import type { FileManager, PlaceMenuState, SidebarPlace } from '$lib/file-manager/manager.svelte';
	import type { TrashCounter } from '$lib/file-manager/places/places.svelte';

	interface Props {
		menu: PlaceMenuState;
		manager: FileManager;
		trash: TrashCounter;
	}

	let { menu, manager, trash }: Props = $props();

	let place = $derived(menu.place);
	let path = $derived(folderOf(place));
	let opensFolder = $derived(place.kind !== 'favorite' || place.bookmark.is_dir);

	function folderOf(place: SidebarPlace) {
		if (place.kind === 'folder') return place.path;
		if (place.kind === 'favorite') return place.bookmark.path;
		if (place.kind === 'drive') return place.drive.mount_point;
		return null;
	}

	function run(action: () => unknown) {
		manager.placeMenu = null;
		void action();
	}

	function open() {
		if (place.kind === 'recent' || place.kind === 'trash') return manager.showView(place.kind);
		if (place.kind === 'favorite') return manager.openEntry(place.bookmark);
		return manager.navigate(path!);
	}

	function openInTab() {
		if (place.kind === 'recent' || place.kind === 'trash') return manager.openViewInTab(place.kind);
		return manager.openTab(path!);
	}

	async function emptyTrash() {
		await manager.actions.emptyTrash(null);
		await trash.refresh();
	}
</script>

{#snippet item(icon: IconName, label: string, action: () => unknown, danger = false, disabled = false)}
	<MenuItem {danger} {disabled} onclick={() => run(action)}>
		<Icon name={icon} size={16} />
		<span>{label}</span>
	</MenuItem>
{/snippet}

<ContextMenu at={menu} onclose={() => (manager.placeMenu = null)}>
	{@render item('external-link', 'Open', open)}
	{#if opensFolder}
		{@render item('plus', 'Open in new tab', openInTab)}
	{/if}
	{#if place.kind === 'drive' && place.drive.is_removable}
		{@const drive = place.drive}
		{@render item('eject', 'Eject', () => manager.ejectDrive(drive), false, manager.drives.ejecting.has(drive.mount_point))}
	{/if}
	{#if place.kind === 'favorite'}
		{@const bookmark = place.bookmark}
		{@render item('star', 'Remove from Favorites', () => bookmarks.unpin(bookmark.path))}
	{/if}
	{#if place.kind === 'trash'}
		<MenuSeparator />
		{@render item('trash-2', 'Empty trash', emptyTrash, true, trash.count === 0)}
	{/if}
	{#if path}
		{@const target = path}
		<MenuSeparator />
		{@render item('info', 'Properties', () => showPathProperties(manager, target))}
	{/if}
</ContextMenu>
