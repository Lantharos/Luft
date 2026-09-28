<script lang="ts">
	import { tooltip } from '@luft/ui';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import * as bookmarks from '$lib/file-manager/bookmarks';
	import type { ChooserState } from '$lib/file-manager/chooser.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { dataTransferPaths } from '$lib/file-manager/drag/data-transfer';
	import { dropKey } from '$lib/file-manager/drag/drop-targets';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import type { PinnedFolder } from '$lib/types';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		chooser: ChooserState | null;
		hidden: Set<string>;
		onopentab: (event: MouseEvent, open: () => void) => void;
	}

	let { manager, drag, chooser, hidden, onopentab }: Props = $props();

	const BOOKMARK_ICONS = new Set<IconName>(['monitor', 'download', 'file-text', 'image', 'music', 'video', 'archive', 'code', 'package']);

	let receiving = $state(false);
	let moving = $state<string | null>(null);
	let insertBefore = $state<string | null>(null);

	let favorites = $derived(settings.value.pinnedFolders.filter((bookmark) => !hidden.has(bookmark.path)));

	function key(path: string) {
		return dropKey('sidebar', path);
	}

	function icon(bookmark: PinnedFolder): IconName {
		const named = bookmark.icon as IconName | null;
		if (named && BOOKMARK_ICONS.has(named)) return named;
		return bookmark.is_dir ? 'folder' : 'file';
	}

	function open(bookmark: PinnedFolder) {
		if (chooser) chooser.openFavorite(bookmark);
		else manager.openEntry(bookmark);
	}

	function groupDragOver(event: DragEvent) {
		event.preventDefault();
		if (moving) {
			insertBefore = null;
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
			return;
		}
		receiving = true;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	}

	function groupDragLeave(event: DragEvent) {
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget instanceof HTMLElement && event.currentTarget.contains(next)) return;
		receiving = false;
	}

	function groupDrop(event: DragEvent) {
		event.preventDefault();
		if (moving) bookmarks.reorder(moving, null);
		else {
			const dropped = dataTransferPaths(event.dataTransfer);
			void bookmarks.pinPaths(dropped.length > 0 ? dropped : drag.paths, manager.entries);
			drag.end();
		}
		finish();
	}

	function rowDragOver(event: DragEvent, bookmark: PinnedFolder) {
		if (!moving) {
			if (bookmark.is_dir) drag.overPath(event, bookmark.path, key(bookmark.path));
			return;
		}
		if (moving === bookmark.path) return;
		event.preventDefault();
		event.stopPropagation();
		insertBefore = bookmark.path;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	function rowDrop(event: DragEvent, bookmark: PinnedFolder) {
		if (!moving) {
			if (bookmark.is_dir) void drag.drop(event, bookmark.path);
			return;
		}
		if (moving === bookmark.path) return;
		event.preventDefault();
		event.stopPropagation();
		bookmarks.reorder(moving, bookmark.path);
		finish();
	}

	function startMoving(event: DragEvent, path: string) {
		moving = path;
		event.dataTransfer?.setData('application/x-rover-bookmark', path);
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
	}

	function finish() {
		moving = null;
		insertBefore = null;
		receiving = false;
	}
</script>

<div
	class={['sidebar-group sidebar-favorites', receiving && 'is-receiving']}
	role="group"
	aria-label="Favorites"
	ondragenter={groupDragOver}
	ondragover={groupDragOver}
	ondragleave={groupDragLeave}
	ondrop={groupDrop}
>
	{#each favorites as bookmark (bookmark.path)}
		<SidebarItem
			class={insertBefore === bookmark.path ? 'is-insert-target' : ''}
			icon={icon(bookmark)}
			label={bookmark.name}
			active={manager.view === 'home' && manager.currentPath === bookmark.path}
			dropping={bookmark.is_dir && drag.target?.key === key(bookmark.path)}
			draggable="true"
			onclick={() => open(bookmark)}
			onauxclick={(event) => onopentab(event, () => (bookmark.is_dir ? manager.openTab(bookmark.path) : manager.openEntry(bookmark)))}
			ondragstart={(event) => startMoving(event, bookmark.path)}
			ondragover={(event) => rowDragOver(event, bookmark)}
			ondragleave={drag.leave}
			ondrop={(event) => rowDrop(event, bookmark)}
			ondragend={finish}
			data-drop-path={bookmark.is_dir ? bookmark.path : undefined}
			data-drop-key={bookmark.is_dir ? key(bookmark.path) : undefined}
		>
			{#snippet trailing()}
				<button
					class="sidebar-item__action is-reveal"
					type="button"
					aria-label={`Remove ${bookmark.name} from Favorites`}
					onclick={() => bookmarks.unpin(bookmark.path)}
					{@attach tooltip('Remove from Favorites')}
				>
					<Icon name="x" size={14} />
				</button>
			{/snippet}
		</SidebarItem>
	{/each}
	{#if receiving && !moving}
		<p class="sidebar-hint">Drop to add to Favorites</p>
	{/if}
</div>
