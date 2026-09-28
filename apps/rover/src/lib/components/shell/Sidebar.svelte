<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import * as bookmarks from '$lib/file-manager/bookmarks';
	import type { ChooserState } from '$lib/file-manager/chooser.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { dataTransferPaths } from '$lib/file-manager/drag/data-transfer';
	import { dropKey, TRASH_DROP_PATH } from '$lib/file-manager/drag/drop-targets';
	import { isDrivePath } from '$lib/file-manager/listing/view-modes';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import type { DriveInfo, PinnedFolder, SidebarView } from '$lib/types';

	interface Props {
		manager: FileManager;
		drag: DragController;
		chooser: ChooserState | null;
	}

	let { manager, drag, chooser }: Props = $props();

	type SidebarIcon = 'folder' | 'file' | 'monitor' | 'download' | 'file-text' | 'image' | 'music' | 'video' | 'archive' | 'code' | 'package';

	const BOOKMARK_ICONS = new Set<string>(['monitor', 'download', 'file-text', 'image', 'music', 'video', 'archive', 'code', 'package']);
	const PRIMARY_NAV = [
		{ view: 'home', label: 'Home', icon: 'home' },
		{ view: 'favorites', label: 'Favorites', icon: 'star' },
		{ view: 'drives', label: 'Drives', icon: 'hard-drive' },
		{ view: 'trash', label: 'Trash', icon: 'trash' }
	] as const;

	let searchInput = $state<HTMLInputElement>();
	let bookmarkDropActive = $state(false);
	let movingBookmark = $state<string | null>(null);
	let bookmarkInsertBefore = $state<string | null>(null);

	let navigableViews = $derived(PRIMARY_NAV.filter((item) => !(chooser && item.view === 'trash')));

	export function focusSearch() {
		searchInput?.focus();
		searchInput?.select();
	}

	function rowClasses(active: boolean, dropping = false) {
		return [
			'group flex h-11 w-full items-center rounded-full text-left text-[16px] transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.96]',
			dropping
				? 'bg-[rgba(200,182,111,0.16)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
				: active
					? 'bg-[var(--sidebar-active)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
					: 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-active)] hover:text-[var(--text)] hover:shadow-[inset_0_1px_0_var(--hairline)]'
		];
	}

	function sidebarKey(path: string) {
		return dropKey('sidebar', path);
	}

	function primaryActive(view: SidebarView) {
		const { view: current, currentPath } = manager;
		if (view === 'home') return current === 'home' && currentPath === manager.homePath;
		if (view === 'drives') {
			if (current === 'drives') return true;
			return current === 'home' && !isDrivePath(currentPath, manager.drives.sidebar) && isDrivePath(currentPath, manager.drives.list);
		}
		return current === view;
	}

	function primaryDropPath(view: SidebarView) {
		if (view === 'home') return manager.homePath;
		return view === 'trash' ? TRASH_DROP_PATH : null;
	}

	function primaryOver(event: DragEvent, view: SidebarView) {
		if (view === 'trash') drag.overTrash(event, sidebarKey(TRASH_DROP_PATH));
		if (view === 'home') drag.overPath(event, manager.homePath, sidebarKey(manager.homePath));
	}

	function primaryDrop(event: DragEvent, view: SidebarView) {
		if (view === 'trash') void drag.dropOnTrash(event);
		if (view === 'home') void drag.drop(event, manager.homePath);
	}

	function openInTab(event: MouseEvent, open: () => void) {
		if (event.button !== 1) return;
		event.preventDefault();
		event.stopPropagation();
		open();
	}

	function openBookmark(bookmark: PinnedFolder) {
		if (chooser) chooser.openFavorite(bookmark);
		else manager.openEntry(bookmark);
	}

	function bookmarkIcon(bookmark: PinnedFolder): SidebarIcon {
		if (bookmark.icon && BOOKMARK_ICONS.has(bookmark.icon)) return bookmark.icon as SidebarIcon;
		return bookmark.is_dir ? 'folder' : 'file';
	}

	function listDragOver(event: DragEvent) {
		event.preventDefault();
		if (movingBookmark) {
			bookmarkInsertBefore = null;
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
			return;
		}
		bookmarkDropActive = true;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	}

	function listDrop(event: DragEvent) {
		event.preventDefault();
		if (movingBookmark) {
			bookmarks.reorder(movingBookmark, null);
		} else {
			const dropped = dataTransferPaths(event.dataTransfer);
			void bookmarks.pinPaths(dropped.length > 0 ? dropped : drag.paths, manager.entries);
			drag.end();
		}
		finishBookmarkDrag();
	}

	function rowDragOver(event: DragEvent, bookmark: PinnedFolder) {
		if (!movingBookmark) {
			if (bookmark.is_dir) drag.overPath(event, bookmark.path, sidebarKey(bookmark.path));
			return;
		}
		if (movingBookmark === bookmark.path) return;
		event.preventDefault();
		event.stopPropagation();
		bookmarkInsertBefore = bookmark.path;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	function rowDrop(event: DragEvent, bookmark: PinnedFolder) {
		if (!movingBookmark) {
			if (bookmark.is_dir) void drag.drop(event, bookmark.path);
			return;
		}
		if (movingBookmark === bookmark.path) return;
		event.preventDefault();
		event.stopPropagation();
		bookmarks.reorder(movingBookmark, bookmark.path);
		finishBookmarkDrag();
	}

	function startBookmarkDrag(event: DragEvent, path: string) {
		movingBookmark = path;
		event.dataTransfer?.setData('application/x-rover-bookmark', path);
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
	}

	function finishBookmarkDrag() {
		movingBookmark = null;
		bookmarkInsertBefore = null;
		bookmarkDropActive = false;
	}

	function driveRow(drive: DriveInfo) {
		const key = sidebarKey(drive.mount_point);
		return rowClasses(manager.view === 'home' && isDrivePath(manager.currentPath, [drive]), drag.target?.key === key);
	}
</script>

<aside class="rover-sidebar drag-region flex w-[260px] shrink-0 flex-col px-2.5 pb-4 pt-3" data-effect={manager.translucent ? 'translucent' : 'opaque'}>
	<div class="px-0.5 pb-3 pt-1">
		<label
			class="sidebar-search flex h-11 items-center gap-3 rounded-full bg-[var(--sidebar-control)] px-3.5 text-[var(--sidebar-text-muted)] shadow-[inset_0_1px_0_var(--hairline)] hover:bg-[var(--sidebar-control-hover)] hover:text-[var(--text)]"
			data-no-drag
		>
			<Icon name="search" size={17} />
			<input
				bind:this={searchInput}
				class="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--sidebar-text-muted)]"
				type="text"
				value={manager.searchQuery}
				placeholder="Search current folder"
				aria-label="Search current folder"
				oninput={(event) => (manager.searchQuery = event.currentTarget.value)}
			/>
		</label>
	</div>

	<nav class="flex flex-col gap-1 p-0.5" aria-label="Main locations" data-no-drag>
		{#each navigableViews as item (item.view)}
			{@const dropPath = primaryDropPath(item.view)}
			{@const key = dropPath ? sidebarKey(dropPath) : undefined}
			<div class={rowClasses(primaryActive(item.view), Boolean(key) && drag.target?.key === key)}>
				<button
					class="flex h-full min-w-0 flex-1 items-center gap-3 px-3 text-left"
					type="button"
					onclick={() => manager.showView(item.view)}
					onauxclick={(event) => openInTab(event, () => manager.openViewInTab(item.view))}
					ondragover={(event) => primaryOver(event, item.view)}
					ondragleave={drag.leave}
					ondrop={(event) => primaryDrop(event, item.view)}
					data-drop-path={dropPath && dropPath !== TRASH_DROP_PATH ? dropPath : undefined}
					data-drop-key={key}
					data-drop-trash={dropPath === TRASH_DROP_PATH ? '' : undefined}
				>
					<Icon name={item.icon} size={19} />
					<span class="truncate">{item.label}</span>
				</button>
			</div>
		{/each}
	</nav>

	{#if manager.drives.sidebar.length > 0}
		<div class="mx-1 my-3 h-px bg-[var(--hairline)]"></div>

		<nav class="flex flex-col gap-1 p-0.5" aria-label="External drives" data-no-drag>
			{#each manager.drives.sidebar as drive (drive.mount_point)}
				{@const ejecting = manager.drives.ejecting.has(drive.mount_point)}
				<div class={[...driveRow(drive), ejecting && 'opacity-60']}>
					<button
						class="flex h-full min-w-0 flex-1 items-center gap-3 px-3 text-left"
						type="button"
						disabled={ejecting}
						onclick={() => manager.navigate(drive.mount_point)}
						onauxclick={(event) => openInTab(event, () => manager.openTab(drive.mount_point))}
						ondragover={(event) => drag.overPath(event, drive.mount_point, sidebarKey(drive.mount_point))}
						ondragleave={drag.leave}
						ondrop={(event) => drag.drop(event, drive.mount_point)}
						data-drop-path={drive.mount_point}
						data-drop-key={sidebarKey(drive.mount_point)}
					>
						<Icon name={ejecting ? 'refresh' : 'usb'} size={19} class={ejecting ? 'animate-spin' : ''} />
						<span class="truncate">{drive.name}{ejecting ? ' · Ejecting' : ''}</span>
					</button>
					<button
						class={[
							'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--sidebar-text-muted)] transition-[background-color,color,opacity,transform] duration-150 active:scale-[0.96]',
							ejecting ? 'opacity-100' : 'opacity-0 hover:bg-[var(--sidebar-control-hover)] hover:text-[var(--text)] group-hover:opacity-100'
						]}
						type="button"
						disabled={ejecting}
						aria-label={ejecting ? `${drive.name} is ejecting` : `Eject ${drive.name}`}
						onclick={(event) => {
							event.stopPropagation();
							void manager.ejectDrive(drive);
						}}
					>
						<Icon name={ejecting ? 'refresh' : 'eject'} size={14} class={ejecting ? 'animate-spin' : ''} />
					</button>
					<button
						class="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--sidebar-text-muted)] opacity-0 transition-[background-color,color,opacity,transform] duration-150 hover:bg-[var(--sidebar-control-hover)] hover:text-[var(--text)] group-hover:opacity-100 active:scale-[0.96]"
						type="button"
						disabled={ejecting}
						aria-label={`Hide ${drive.name} from sidebar`}
						onclick={(event) => {
							event.stopPropagation();
							manager.drives.hidden.add(drive.mount_point);
						}}
					>
						<Icon name="x" size={14} />
					</button>
				</div>
			{/each}
		</nav>
	{/if}

	<div class="mx-1 my-3 h-px bg-[var(--hairline)]"></div>

	<nav
		class={[
			'soft-scroll flex min-h-0 flex-col gap-1 overflow-y-auto rounded-[18px] p-0.5 transition-[background-color,box-shadow] duration-150',
			bookmarkDropActive && 'bg-[var(--sidebar-active)] shadow-[inset_0_0_0_1px_var(--hairline)]'
		]}
		aria-label="Bookmarks"
		data-no-drag
		ondragenter={listDragOver}
		ondragover={listDragOver}
		ondragleave={() => (bookmarkDropActive = false)}
		ondrop={listDrop}
	>
		{#each settings.value.pinnedFolders as bookmark (bookmark.path)}
			<div
				class={[
					...rowClasses(
						manager.view === 'home' && manager.currentPath === bookmark.path,
						bookmark.is_dir && drag.target?.key === sidebarKey(bookmark.path)
					),
					bookmarkInsertBefore === bookmark.path && 'bg-[rgba(200,182,111,0.12)] shadow-[inset_0_1px_0_var(--hairline)]'
				]}
				draggable="true"
				role="group"
				ondragstart={(event) => startBookmarkDrag(event, bookmark.path)}
				ondragover={(event) => rowDragOver(event, bookmark)}
				ondragleave={drag.leave}
				ondrop={(event) => rowDrop(event, bookmark)}
				ondragend={finishBookmarkDrag}
				data-drop-path={bookmark.is_dir ? bookmark.path : undefined}
				data-drop-key={bookmark.is_dir ? sidebarKey(bookmark.path) : undefined}
			>
				<button
					class="flex h-full min-w-0 flex-1 items-center gap-3 px-3 text-left"
					type="button"
					onclick={() => openBookmark(bookmark)}
					onauxclick={(event) =>
						openInTab(event, () => (bookmark.is_dir ? manager.openTab(bookmark.path) : manager.openEntry(bookmark)))}
				>
					<Icon name={bookmarkIcon(bookmark)} size={19} />
					<span class="truncate">{bookmark.name}</span>
				</button>
				<button
					class="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--sidebar-text-muted)] opacity-0 transition-[background-color,color,opacity,transform] duration-150 hover:bg-[var(--sidebar-control-hover)] hover:text-[var(--text)] group-hover:opacity-100 active:scale-[0.96]"
					type="button"
					aria-label={`Remove ${bookmark.name}`}
					onclick={() => bookmarks.unpin(bookmark.path)}
				>
					<Icon name="x" size={14} />
				</button>
			</div>
		{/each}
	</nav>
</aside>
