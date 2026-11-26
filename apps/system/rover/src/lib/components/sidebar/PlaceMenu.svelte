<script lang="ts">
	import Eject from '@luft/symbols/icons/eject';
	import ExternalLink from '@luft/symbols/icons/external-link';
	import EyeOff from '@luft/symbols/icons/eye-off';
	import Globe from '@luft/symbols/icons/globe';
	import HardDrive from '@luft/symbols/icons/hard-drive';
	import Info from '@luft/symbols/icons/info';
	import Palette from '@luft/symbols/icons/palette';
	import Plus from '@luft/symbols/icons/plus';
	import Star from '@luft/symbols/icons/star';
	import Trash2 from '@luft/symbols/icons/trash-2';
	import { t } from '@luft/i18n';
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { Component } from 'svelte';
	import { commands } from '#lib/bindings.js';
	import * as api from '#lib/bridge/index.js';
	import { showPathProperties } from '#lib/features/actions.js';
	import { dialogs } from '#lib/features/dialogs.svelte.js';
	import type { FileManager, PlaceMenuState, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import type { TrashCounter } from '#lib/file-manager/places/places.svelte.js';
	import * as sidebar from '#lib/file-manager/places/sidebar.js';

	interface Props {
		menu: PlaceMenuState;
		manager: FileManager;
		trash: TrashCounter;
	}

	let { menu, manager, trash }: Props = $props();

	let place = $derived(menu.place);
	let path = $derived(folderOf(place));
	let shownView = $derived(place.kind === 'entry' && place.row.entry.kind === 'place' && sidebar.isView(place.row.entry.place) ? place.row.entry.place : null);
	let opensFolder = $derived(place.kind !== 'entry' || sidebar.opensFolder(place.row.entry));
	let missing = $derived(place.kind === 'entry' ? sidebar.missing(manager.userDirs) : []);

	function folderOf(place: SidebarPlace) {
		if (place.kind === 'entry') return place.row.path;
		if (place.kind === 'drive') return place.drive.mountPoint;
		if (place.kind === 'network') return place.entry.location?.path ?? null;
		return null;
	}

	function run(action: () => unknown) {
		void action();
		manager.placeMenu = null;
	}

	function open() {
		if (shownView) return manager.showView(shownView);
		if (place.kind === 'entry') return manager.openEntry({ path: path!, isDir: opensFolder });
		if (place.kind === 'network' && !path) return manager.openAddress(place.entry.place.uri);
		return manager.navigate(path!);
	}

	function openInTab() {
		if (shownView) return manager.openViewInTab(shownView);
		if (place.kind === 'network' && !path) return manager.openAddress(place.entry.place.uri, manager.openTab);
		return manager.openTab(path!);
	}

	async function changeIcon(path: string) {
		dialogs.look([await commands.getFileInfo({ path })]);
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
	{@render item(ExternalLink, t('rover-open'), open)}
	{#if opensFolder}
		{@render item(Plus, t('rover-place-open-in-new-tab'), openInTab)}
	{/if}
	{#if place.kind === 'drive' && place.drive.canUnmount}
		{@const drive = place.drive}
		{@render item(Eject, drive.isRemovable ? t('rover-drive-eject') : t('rover-drive-unmount'), () => manager.ejectDrive(drive), false, manager.drives.ejecting.has(drive.mountPoint))}
	{/if}
	{#if place.kind === 'drive' && manager.drives.manageable}
		{@const drive = place.drive}
		{@render item(HardDrive, t('rover-drive-manage'), () => api.manageDrive(drive.mountPoint).catch(manager.notify))}
	{/if}
	{#if place.kind === 'network'}
		{@const entry = place.entry}
		{#if entry.location}
			{@const location = entry.location}
			{@render item(Eject, t('rover-network-disconnect'), () => manager.disconnectNetwork(location.uri))}
		{/if}
		{#if entry.saved}
			{@render item(Star, t('rover-menu-remove-from-sidebar'), () => manager.network.forget(entry.place.uri))}
		{:else}
			{@render item(Star, t('rover-connect-keep'), () => manager.network.save(entry.place))}
		{/if}
		<MenuSeparator />
		{@render item(Globe, t('rover-connect-to-server'), () => dialogs.connect())}
	{/if}
	{#if place.kind === 'entry'}
		{@const key = place.row.key}
		{@render item(EyeOff, t('rover-menu-remove-from-sidebar'), () => sidebar.remove(key))}
	{/if}
	{#if place.kind === 'entry' && opensFolder && path}
		{@const folder = path}
		{@render item(Palette, t('rover-menu-change-icon'), () => changeIcon(folder).catch(manager.notify))}
	{/if}
	{#if missing.length > 0}
		<MenuSeparator />
		{#each missing as absent (absent)}
			{@render item(sidebar.placeArt(absent, manager.userDirs).icon, t('rover-place-show', { name: sidebar.placeLabel(absent, manager.userDirs) }), () => sidebar.restore(absent))}
		{/each}
	{/if}
	{#if shownView === 'trash'}
		<MenuSeparator />
		{@render item(Trash2, t('rover-empty-trash'), emptyTrash, true, trash.count === 0)}
	{/if}
	{#if path}
		{@const target = path}
		<MenuSeparator />
		{@render item(Info, t('rover-menu-properties'), () =>
 showPathProperties(manager, target))}
	{/if}
</ContextMenu>
