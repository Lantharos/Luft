<script lang="ts">
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import * as tools from '$lib/features/actions';
	import { isArchive } from '$lib/features/archives';
	import * as bookmarks from '$lib/file-manager/bookmarks';
	import type { ContextMenuState, FileManager } from '$lib/file-manager/manager.svelte';
	import type { ViewState } from '$lib/file-manager/view/view-state.svelte';
	import type { FileEntry } from '$lib/types';
	import { primaryActionLabel } from '$lib/vcs/format';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		menu: ContextMenuState;
		manager: FileManager;
		view: ViewState;
		vcs: VcsState;
	}

	let { menu, manager, view, vcs }: Props = $props();

	let target = $derived(menu.target);
	let isPinned = $derived(Boolean(target && bookmarks.isPinned(target.path)));
	let offersVcs = $derived(Boolean(vcs.project && (!target || target.is_dir || vcs.statusFor(target.path, false))));
	let primaryAction = $derived(primaryActionLabel(vcs.project));
	let targets = $derived(target ? tools.targetsOf(manager, target) : []);
	let archives = $derived(targets.length > 0 && targets.every((entry) => !entry.is_dir && isArchive(entry.name)));

	function close() {
		manager.contextMenu = null;
	}

	function run(action: () => unknown) {
		void action();
		close();
	}

	function viewChanges(entry: FileEntry | null) {
		vcs.panelOpen = true;
		if (entry && !entry.is_dir) void vcs.loadDiff(vcs.relativePath(entry.path));
	}

	function saveChanges(entry: FileEntry | null) {
		vcs.openSaveDialog(entry && !entry.is_dir ? [vcs.relativePath(entry.path)] : null);
	}
</script>

{#snippet item(icon: IconName, label: string, action: () => unknown, danger = false, disabled = false)}
	<MenuItem {danger} {disabled} onclick={() => run(action)}>
		<Icon name={icon} size={16} />
		<span>{label}</span>
	</MenuItem>
{/snippet}

<ContextMenu at={menu} onclose={close}>
	{#if target}
		{@render item('external-link', 'Open', () => manager.openEntry(target))}
		{#if !target.is_dir}
			{@render item('eye', 'Quick Look', view.toggleQuickLook)}
		{/if}
		{#if offersVcs}
			{@render item('code', target.is_dir ? 'View project changes' : 'View changes', () => viewChanges(target))}
			{@render item('check', target.is_dir ? `${primaryAction} changes` : `${primaryAction} this file`, () => saveChanges(target))}
		{/if}
		{#if target.is_dir}
			{@render item('plus', 'Open in tab', () => manager.openTab(target.path))}
		{/if}
		{@render item('star', isPinned ? 'Remove from Favorites' : 'Add to Favorites', () => bookmarks.togglePinned(target))}
		<MenuSeparator />
		{@render item('scissors', 'Cut', manager.actions.cut)}
		{@render item('copy', 'Copy', manager.actions.copy)}
		{@render item('copy-plus', 'Duplicate', () => tools.duplicate(manager, targets))}
		{@render item('link', targets.length > 1 ? 'Copy paths' : 'Copy path', () => tools.copyPaths(manager, targets))}
		<MenuSeparator />
		{@render item('edit', targets.length > 1 ? 'Rename…' : 'Rename', () => tools.rename(manager, targets))}
		{@render item('archive', 'Compress…', () => tools.compress(manager, targets))}
		{#if archives}
			{@render item('package-open', 'Extract here', () => tools.extract(manager, targets))}
		{/if}
		{#if target.is_dir}
			{@render item('terminal', 'Open in terminal', () => tools.openTerminal(manager, target.path))}
		{/if}
		{@render item('info', 'Properties', () => tools.showProperties(manager, targets))}
		<MenuSeparator />
		{@render item('trash-2', 'Move to trash', manager.actions.trashSelected, true)}
	{:else}
		{@render item('folder-plus', 'New folder', () => manager.startCreate('folder'))}
		{@render item('file-plus', 'New file', () => manager.startCreate('file'))}
		<MenuSeparator />
		{@render item('clipboard', 'Paste', manager.actions.paste, false, manager.clipboard.items.length === 0)}
		<MenuSeparator />
		{@render item('search', 'Search in this folder', () => tools.searchHere(manager))}
		{@render item('terminal', 'Open terminal here', () => tools.openTerminal(manager, manager.currentPath))}
		{@render item('info', 'Properties', () => tools.showPathProperties(manager, manager.currentPath))}
		{#if offersVcs}
			<MenuSeparator />
			{@render item('code', 'View project changes', () => viewChanges(null))}
			{@render item('check', `${primaryAction} changes`, () => saveChanges(null))}
			{@render item('refresh', 'Sync project', vcs.sync)}
		{/if}
	{/if}
</ContextMenu>
