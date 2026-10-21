<script lang="ts">
	import Archive from '@lucide/svelte/icons/archive';
	import ChartPie from '@lucide/svelte/icons/chart-pie';
	import Check from '@lucide/svelte/icons/check';
	import Clipboard from '@lucide/svelte/icons/clipboard';
	import Cloud from '@lucide/svelte/icons/cloud';
	import Code from '@lucide/svelte/icons/code';
	import Copy from '@lucide/svelte/icons/copy';
	import CopyPlus from '@lucide/svelte/icons/copy-plus';
	import Download from '@lucide/svelte/icons/download';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Eye from '@lucide/svelte/icons/eye';
	import FilePlus from '@lucide/svelte/icons/file-plus';
	import FolderPlus from '@lucide/svelte/icons/folder-plus';
	import Globe from '@lucide/svelte/icons/globe';
	import Info from '@lucide/svelte/icons/info';
	import Link from '@lucide/svelte/icons/link';
	import PackageOpen from '@lucide/svelte/icons/package-open';
	import Plus from '@lucide/svelte/icons/plus';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Scissors from '@lucide/svelte/icons/scissors';
	import Search from '@lucide/svelte/icons/search';
	import SquarePen from '@lucide/svelte/icons/square-pen';
	import Star from '@lucide/svelte/icons/star';
	import Terminal from '@lucide/svelte/icons/terminal';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { Component } from 'svelte';
	import * as tools from '#lib/features/actions.js';
	import * as cloud from '#lib/features/cloud.js';
	import { isArchive } from '#lib/features/archives.js';
	import * as bookmarks from '#lib/file-manager/places/bookmarks.js';
	import type { ContextMenuState, FileManager } from '#lib/file-manager/manager.svelte.js';
	import type { ViewState } from '#lib/file-manager/view/view-state.svelte.js';
	import type { FileEntry } from '#lib/types/index.js';
	import type { VcsState } from '#lib/vcs/state.svelte.js';

	interface Props {
		menu: ContextMenuState;
		manager: FileManager;
		view: ViewState;
		vcs: VcsState;
	}

	let { menu, manager, view, vcs }: Props = $props();

	let target = $derived(menu.target);
	let isPinned = $derived(Boolean(target && bookmarks.isPinned(target.path)));
	let offersVcs = $derived(Boolean(vcs.project && (!target || target.isDir || vcs.statusFor(target.path, false))));
	let targets = $derived(target ? tools.targetsOf(manager, target) : []);
	let cloudDrive = $derived(target ? manager.cloud.holding(target.path) : undefined);
	let kept = $derived(cloud.keptEverywhere(manager, targets));
	let archives = $derived(targets.length > 0 && targets.every((entry) => !entry.isDir && isArchive(entry.name)));

	function close() {
		manager.contextMenu = null;
	}

	function run(action: () => unknown) {
		void action();
		close();
	}

	function viewChanges(entry: FileEntry | null) {
		vcs.panelOpen = true;
		if (entry && !entry.isDir) void vcs.loadDiff(vcs.relativePath(entry.path));
	}

	function saveChanges(entry: FileEntry | null) {
		vcs.openSaveDialog(entry && !entry.isDir ? [vcs.relativePath(entry.path)] : null);
	}
</script>

{#snippet item(Icon: Component, label: string, action: () => unknown, danger = false, disabled = false)}
	<MenuItem {danger} {disabled} onclick={() => run(action)}>
		<Icon size={16} />
		<span>{label}</span>
	</MenuItem>
{/snippet}

<ContextMenu at={menu} onclose={close}>
	{#if target}
		{@render item(ExternalLink, 'Open', () => manager.openEntry(target))}
		{#if !target.isDir}
			{@render item(Eye, 'Quick Look', view.toggleQuickLook)}
		{/if}
		{#if offersVcs}
			{@render item(Code, target.isDir ? 'View project changes' : 'View changes', () => viewChanges(target))}
			{@render item(Check, target.isDir ? 'Commit changes' : 'Commit this file', () => saveChanges(target))}
		{/if}
		{#if target.isDir}
			{@render item(Plus, 'Open in tab', () => manager.openTab(target.path))}
		{/if}
		{@render item(Star, isPinned ? 'Remove from Favorites' : 'Add to Favorites', () => bookmarks.togglePinned(target))}
		{#if cloudDrive}
			<MenuSeparator />
			{#if kept}
				{@render item(Cloud, 'Free up space', () => cloud.free(manager, targets))}
			{:else}
				{@render item(Download, 'Keep on this device', () => cloud.keep(manager, targets))}
			{/if}
			{#if targets.length === 1 && cloudDrive.shareLinks}
				{@render item(Link, 'Copy share link', () => cloud.copyShareLink(manager, target))}
			{/if}
			{#if targets.length === 1 && cloudDrive.web}
				{@render item(Globe, 'Open in browser', () => cloud.openInBrowser(manager, target))}
			{/if}
		{/if}
		<MenuSeparator />
		{@render item(Scissors, 'Cut', manager.actions.cut)}
		{@render item(Copy, 'Copy', manager.actions.copy)}
		{@render item(CopyPlus, 'Duplicate', () => tools.duplicate(manager, targets))}
		{@render item(Link, targets.length > 1 ? 'Copy paths' : 'Copy path', () => tools.copyPaths(manager, targets))}
		<MenuSeparator />
		{@render item(SquarePen, targets.length > 1 ? 'Rename…' : 'Rename', () => tools.rename(manager, targets))}
		{@render item(Archive, 'Compress…', () => tools.compress(manager, targets))}
		{#if archives}
			{@render item(PackageOpen, 'Extract here', () => tools.extract(manager, targets))}
		{/if}
		{#if target.isDir}
			{@render item(Terminal, 'Open in terminal', () => tools.openTerminal(manager, target.path))}
			{#if manager.drives.manageable}
				{@render item(ChartPie, 'See what’s using space', () => tools.exploreSpace(manager, target.path))}
			{/if}
		{/if}
		{@render item(Info, 'Properties', () => tools.showProperties(targets))}
		<MenuSeparator />
		{@render item(Trash2, 'Move to trash', manager.actions.trashSelected, true)}
	{:else}
		{@render item(FolderPlus, 'New folder', () => manager.startCreate('folder'))}
		{@render item(FilePlus, 'New file', () => manager.startCreate('file'))}
		<MenuSeparator />
		{@render item(Clipboard, 'Paste', manager.actions.paste, false, manager.clipboard.items.length === 0)}
		<MenuSeparator />
		{@render item(Search, 'Search in this folder', () => tools.searchHere(manager))}
		{@render item(Terminal, 'Open terminal here', () => tools.openTerminal(manager, manager.currentPath))}
		{#if manager.drives.manageable}
			{@render item(ChartPie, 'See what’s using space', () => tools.exploreSpace(manager, manager.currentPath))}
		{/if}
		{@render item(Info, 'Properties', () => tools.showPathProperties(manager, manager.currentPath))}
		{#if offersVcs}
			<MenuSeparator />
			{@render item(Code, 'View project changes', () => viewChanges(null))}
			{@render item(Check, 'Commit changes', () => saveChanges(null))}
			{@render item(RefreshCw, 'Sync project', vcs.sync)}
		{/if}
	{/if}
</ContextMenu>
