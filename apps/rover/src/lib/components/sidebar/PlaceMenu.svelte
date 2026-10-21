<script lang="ts">
	import Eject from '@lucide/svelte/icons/eject';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Globe from '@lucide/svelte/icons/globe';
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import Info from '@lucide/svelte/icons/info';
	import Plus from '@lucide/svelte/icons/plus';
	import Star from '@lucide/svelte/icons/star';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { Component } from 'svelte';
	import * as api from '#lib/bridge/index.js';
	import { showPathProperties } from '#lib/features/actions.js';
	import { dialogs } from '#lib/features/dialogs.svelte.js';
	import * as bookmarks from '#lib/file-manager/places/bookmarks.js';
	import type { FileManager, PlaceMenuState, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import type { TrashCounter } from '#lib/file-manager/places/places.svelte.js';
	import { setPlaceHidden } from '#lib/state/settings.svelte.js';

	interface Props {
		menu: PlaceMenuState;
		manager: FileManager;
		trash: TrashCounter;
	}

	let { menu, manager, trash }: Props = $props();

	let place = $derived(menu.place);
	let path = $derived(folderOf(place));
	let opensFolder = $derived(place.kind !== 'favorite' || place.bookmark.isDir);

	function folderOf(place: SidebarPlace) {
		if (place.kind === 'folder') return place.path;
		if (place.kind === 'favorite') return place.bookmark.path;
		if (place.kind === 'drive') return place.drive.mountPoint;
		if (place.kind === 'network') return place.entry.location?.path ?? null;
		return null;
	}

	function run(action: () => unknown) {
		void action();
		manager.placeMenu = null;
	}

	function open() {
		if (place.kind === 'recent' || place.kind === 'trash') return manager.showView(place.kind);
		if (place.kind === 'favorite') return manager.openEntry(place.bookmark);
		if (place.kind === 'network' && !path) return manager.openAddress(place.entry.place.uri);
		return manager.navigate(path!);
	}

	function openInTab() {
		if (place.kind === 'recent' || place.kind === 'trash') return manager.openViewInTab(place.kind);
		if (place.kind === 'network' && !path) return manager.openAddress(place.entry.place.uri, manager.openTab);
		return manager.openTab(path!);
	}

	function emptyTrash() {
		dialogs.emptyTrash(null);
	}
</script>

{#snippet item(Icon: Component, label: string, action: () => unknown, danger = false, disabled = false)}
	<MenuItem {danger} {disabled} onclick={() => run(action)}>
		<Icon size={16} />
		<span>{label}</span>
	</MenuItem>
{/snippet}

<ContextMenu at={menu} onclose={() => (manager.placeMenu = null)}>
	{@render item(ExternalLink, 'Open', open)}
	{#if opensFolder}
		{@render item(Plus, 'Open in new tab', openInTab)}
	{/if}
	{#if place.kind === 'drive' && place.drive.isRemovable}
		{@const drive = place.drive}
		{@render item(Eject, 'Eject', () => manager.ejectDrive(drive), false, manager.drives.ejecting.has(drive.mountPoint))}
	{/if}
	{#if place.kind === 'drive' && manager.drives.manageable}
		{@const drive = place.drive}
		{@render item(HardDrive, 'Manage drive…', () => api.manageDrive(drive.mountPoint).catch(manager.notify))}
	{/if}
	{#if place.kind === 'network'}
		{@const entry = place.entry}
		{#if entry.location}
			{@const location = entry.location}
			{@render item(Eject, 'Disconnect', () => manager.disconnectNetwork(location.uri))}
		{/if}
		{#if entry.saved}
			{@render item(Star, 'Remove from sidebar', () => manager.network.forget(entry.place.uri))}
		{:else}
			{@render item(Star, 'Keep in sidebar', () => manager.network.save(entry.place))}
		{/if}
		<MenuSeparator />
		{@render item(Globe, 'Connect to server…', () => dialogs.connect())}
	{/if}
	{#if place.kind === 'folder'}
		{@const folder = place.path}
		{@render item(EyeOff, 'Remove from sidebar', () => setPlaceHidden(folder, true))}
	{/if}
	{#if place.kind === 'favorite'}
		{@const bookmark = place.bookmark}
		{@render item(Star, 'Remove from Favorites', () => bookmarks.unpin(bookmark.path))}
	{/if}
	{#if place.kind === 'trash'}
		<MenuSeparator />
		{@render item(Trash2, 'Empty trash', emptyTrash, true, trash.count === 0)}
	{/if}
	{#if path}
		{@const target = path}
		<MenuSeparator />
		{@render item(Info, 'Properties', () => showPathProperties(manager, target))}
	{/if}
</ContextMenu>
