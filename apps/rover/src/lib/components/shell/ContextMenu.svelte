<script lang="ts">
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import * as bookmarks from '$lib/file-manager/bookmarks';
	import type { ContextMenuState, FileManager } from '$lib/file-manager/manager.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import type { FileEntry } from '$lib/types';
	import { primaryActionLabel } from '$lib/vcs/format';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		menu: ContextMenuState;
		manager: FileManager;
		vcs: VcsState;
	}

	let { menu, manager, vcs }: Props = $props();

	const VIEWPORT_MARGIN = 10;

	let target = $derived(menu.target);
	let isFavorite = $derived(Boolean(target && settings.value.favorites.some((favorite) => favorite.path === target.path)));
	let isPinned = $derived(Boolean(target && bookmarks.isPinned(target.path)));
	let offersVcs = $derived(Boolean(vcs.project && (!target || target.is_dir || vcs.statusFor(target.path, false))));
	let primaryAction = $derived(primaryActionLabel(vcs.project));
	let position = $state<{ x: number; y: number; origin: string } | null>(null);

	function place(element: HTMLElement) {
		const rect = element.getBoundingClientRect();
		const opensLeft = menu.x + rect.width + VIEWPORT_MARGIN > innerWidth && menu.x - rect.width > VIEWPORT_MARGIN;
		const opensUp = menu.y + rect.height + VIEWPORT_MARGIN > innerHeight && menu.y - rect.height > VIEWPORT_MARGIN;
		position = {
			x: clamp(opensLeft ? menu.x - rect.width : menu.x, innerWidth - rect.width - VIEWPORT_MARGIN),
			y: clamp(opensUp ? menu.y - rect.height : menu.y, innerHeight - rect.height - VIEWPORT_MARGIN),
			origin: `${opensUp ? 'bottom' : 'top'} ${opensLeft ? 'right' : 'left'}`
		};
	}

	function clamp(value: number, max: number) {
		return Math.min(Math.max(value, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, max));
	}

	function run(action: () => unknown) {
		void action();
		manager.contextMenu = null;
	}

	function viewChanges(entry: FileEntry | null) {
		vcs.panelOpen = true;
		if (entry && !entry.is_dir) void vcs.loadDiff(vcs.relativePath(entry.path));
	}

	function saveChanges(entry: FileEntry | null) {
		vcs.openSaveDialog(entry && !entry.is_dir ? [vcs.relativePath(entry.path)] : null);
	}

	const stop = (event: Event) => event.stopPropagation();
</script>

<svelte:window onresize={() => (manager.contextMenu = null)} />

{#snippet item(icon: IconName, label: string, action: () => unknown, danger = false, disabled = false)}
	<button class={['menu-item', danger && 'text-[var(--danger)]']} type="button" role="menuitem" {disabled} onclick={() => run(action)}>
		<Icon name={icon} size={16} />
		<span>{label}</span>
	</button>
{/snippet}

{#snippet divider()}
	<div class="my-1 h-px bg-[var(--hairline)]"></div>
{/snippet}

<div
	{@attach place}
	class={[
		'fixed z-[80] max-h-[calc(100vh-20px)] w-[196px] overflow-y-auto rounded-[18px] bg-[var(--surface)] p-1 shadow-[0_18px_50px_var(--shadow-soft),inset_0_1px_0_var(--hairline)] transition-[opacity,scale] duration-[120ms]',
		position ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'
	]}
	style:left={`${position?.x ?? menu.x}px`}
	style:top={`${position?.y ?? menu.y}px`}
	style:transform-origin={position?.origin ?? 'top left'}
	role="menu"
	tabindex="-1"
	onkeydown={(event) => event.key === 'Escape' && (manager.contextMenu = null)}
	onclick={stop}
	onpointerdown={stop}
	oncontextmenu={stop}
>
	{#if target}
		{@render item('external-link', 'Open', () => manager.openEntry(target))}
		{#if offersVcs}
			{@render item('code', target.is_dir ? 'View project changes' : 'View changes', () => viewChanges(target))}
			{@render item('check', target.is_dir ? `${primaryAction} changes` : `${primaryAction} this file`, () => saveChanges(target))}
		{/if}
		{#if target.is_dir}
			{@render item('plus', 'Open in tab', () => manager.openTab(target.path))}
		{/if}
		{@render item(isFavorite ? 'check' : 'star', isFavorite ? 'Remove favorite' : 'Add favorite', () => manager.actions.toggleFavorite(target))}
		{@render item(isPinned ? 'check' : 'pin', isPinned ? 'Remove from sidebar' : 'Pin to sidebar', () => bookmarks.togglePinned(target))}
		{@render divider()}
		{@render item('scissors', 'Cut', manager.actions.cut)}
		{@render item('copy', 'Copy', manager.actions.copy)}
		{@render divider()}
		{@render item('edit', 'Rename', () => manager.startRename(target))}
		{@render item('trash-2', 'Move to trash', manager.actions.trashSelected, true)}
	{:else}
		{@render item('folder-plus', 'New folder', () => manager.startCreate('folder'))}
		{@render item('file-plus', 'New file', () => manager.startCreate('file'))}
		{@render divider()}
		{@render item('clipboard', 'Paste', manager.actions.paste, false, manager.clipboard.items.length === 0)}
		{#if offersVcs}
			{@render divider()}
			{@render item('code', 'View project changes', () => viewChanges(null))}
			{@render item('check', `${primaryAction} changes`, () => saveChanges(null))}
			{@render item('refresh', 'Sync project', vcs.sync)}
		{/if}
	{/if}
</div>
