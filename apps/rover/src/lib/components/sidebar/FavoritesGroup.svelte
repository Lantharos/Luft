<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { tooltip } from '@luft/ui';
	import type { PinnedFolder } from '#lib/bindings.js';
	import { KIND_ICONS } from '#lib/components/pane/kind-icons.js';
	import * as bookmarks from '#lib/file-manager/places/bookmarks.js';
	import type { ChooserState } from '#lib/file-manager/chooser.svelte.js';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dataTransferPaths } from '#lib/file-manager/drag/data-transfer.js';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import type { FileKind } from '#lib/utils/kinds.js';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		chooser: ChooserState | null;
		hidden: Set<string>;
		onopentab: (event: MouseEvent, open: () => void) => void;
		onmenu: (event: MouseEvent, place: SidebarPlace) => void;
	}

	let { manager, drag, chooser, hidden, onopentab, onmenu }: Props = $props();

	let receiving = $state(false);
	let moving = $state<string | null>(null);
	let insertBefore = $state<string | null>(null);

	let favorites = $derived(settings.value.pinnedFolders.filter((bookmark) => !hidden.has(bookmark.path)));

	function key(path: string) {
		return dropKey('sidebar', path);
	}

	function icon(bookmark: PinnedFolder) {
		return KIND_ICONS[bookmark.icon as FileKind] ?? KIND_ICONS[bookmark.isDir ? 'folder' : 'file'];
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
			if (bookmark.isDir) drag.overPath(event, bookmark.path, key(bookmark.path));
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
			if (bookmark.isDir) void drag.drop(event, bookmark.path);
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
	class={['sidebar-favorites flex flex-col gap-px', receiving && 'is-receiving']}
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
			dropping={bookmark.isDir && drag.target?.key === key(bookmark.path)}
			draggable="true"
			onclick={() => open(bookmark)}
			onauxclick={(event) => onopentab(event, () => (bookmark.isDir ? manager.openTab(bookmark.path) : manager.openEntry(bookmark)))}
			oncontextmenu={(event) => onmenu(event, { kind: 'favorite', bookmark })}
			ondragstart={(event) => startMoving(event, bookmark.path)}
			ondragover={(event) => rowDragOver(event, bookmark)}
			ondragleave={drag.leave}
			ondrop={(event) => rowDrop(event, bookmark)}
			ondragend={finish}
		>
			{#snippet trailing()}
				<button
					class="sidebar-item__action is-reveal"
					type="button"
					aria-label={`Remove ${bookmark.name} from Favorites`}
					onclick={() => bookmarks.unpin(bookmark.path)}
					{@attach tooltip('Remove from Favorites')}
				>
					<X size={14} />
				</button>
			{/snippet}
		</SidebarItem>
	{/each}
	{#if receiving && !moving}
		<p class="sidebar-hint">Drop to add to Favorites</p>
	{/if}
</div>

<style>
	.sidebar-favorites {
		min-height: 36px;
		flex: 1 0 auto;
		border-radius: 14px;
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.sidebar-favorites.is-receiving {
		background: var(--sidebar-control);
		box-shadow: inset 0 0 0 1px var(--accent-line);
	}

	.sidebar-hint {
		padding: 8px 12px;
		color: var(--sidebar-text-muted);
		font-size: 12.5px;
	}
</style>
