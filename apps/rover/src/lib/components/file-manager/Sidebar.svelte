<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { scopedDropKey, trashDropKey } from '$lib/file-manager/drop-targets';
	import { isDrivePath } from '$lib/file-manager/view-modes';
	import type { DriveInfo, PinnedFolder, SidebarView, UserDirs } from '$lib/types';

	interface Props {
		currentView: SidebarView;
		currentPath: string;
		searchQuery: string;
		userDirs: UserDirs | null;
		pinnedFolders: PinnedFolder[];
		drives: DriveInfo[];
		sidebarDrives: DriveInfo[];
		dropTargetKey: string | null;
		backgroundEffect: 'translucent' | 'opaque';
		onSearch: (value: string) => void;
		onSwitchView: (view: SidebarView) => void;
		onNavigate: (path: string) => void;
		onOpenPathInTab: (path: string) => void;
		onOpenViewInTab: (view: SidebarView) => void;
		onOpenBookmark: (bookmark: PinnedFolder) => void;
		onOpenBookmarkInTab: (bookmark: PinnedFolder) => void;
		onRemoveBookmark: (path: string) => void;
		onHideDrive: (mountPoint: string) => void;
		onEjectDrive: (drive: DriveInfo) => void;
		onPathDragOver: (event: DragEvent, targetPath: string, targetKey?: string) => boolean;
		onPathDrop: (event: DragEvent, targetPath: string) => void;
		onPathDragLeave: () => void;
		onTrashDragOver: (event: DragEvent, targetKey?: string) => boolean;
		onTrashDrop: (event: DragEvent) => void;
		onReorderBookmarks: (sourcePath: string, targetPath: string | null) => void;
		onDropBookmark: (event: DragEvent) => void;
	}

	let {
		currentView,
		currentPath,
		searchQuery,
		userDirs,
		pinnedFolders,
		drives,
		sidebarDrives,
		dropTargetKey,
		backgroundEffect,
		onSearch,
		onSwitchView,
		onNavigate,
		onOpenPathInTab,
		onOpenViewInTab,
		onOpenBookmark,
		onOpenBookmarkInTab,
		onRemoveBookmark,
		onHideDrive,
		onEjectDrive,
		onPathDragOver,
		onPathDrop,
		onPathDragLeave,
		onTrashDragOver,
		onTrashDrop,
		onReorderBookmarks,
		onDropBookmark
	}: Props = $props();

	type SidebarIcon =
		| 'folder'
		| 'file'
		| 'monitor'
		| 'download'
		| 'file-text'
		| 'image'
		| 'music'
		| 'video'
		| 'archive'
		| 'code'
		| 'package';

	let isBookmarkDropTarget = $state(false);
	let draggingBookmarkPath = $state<string | null>(null);
	let bookmarkDropPath = $state<string | null>(null);
	let searchInput = $state<HTMLInputElement>();

	const primaryNav = [
		{ view: 'home', label: 'Home', icon: 'home' },
		{ view: 'favorites', label: 'Favorites', icon: 'star' },
		{ view: 'drives', label: 'Drives', icon: 'hard-drive' },
		{ view: 'trash', label: 'Trash', icon: 'trash' }
	] as const;

	function rowStateClasses(active: boolean, dropping = false) {
		return [
			'group flex h-11 w-full items-center rounded-full text-left text-[16px] transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.96]',
			dropping
				? 'bg-[rgba(200,182,111,0.16)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
				: active
				? 'bg-[var(--sidebar-active)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
				: 'text-[var(--text-soft)] hover:bg-[var(--sidebar-active)] hover:text-[var(--text)] hover:shadow-[inset_0_1px_0_var(--hairline)]'
		];
	}

	function bookmarkRowClasses(active: boolean, dropping = false) {
		return rowStateClasses(active, dropping);
	}

	function locationClasses(bookmark: PinnedFolder) {
		return bookmarkRowClasses(
			currentView === 'home' && currentPath === bookmark.path,
			bookmark.is_dir && dropTargetKey === sidebarDropKey(bookmark.path)
		);
	}

	function sidebarDropKey(path: string) {
		return scopedDropKey('sidebar', path);
	}

	function primaryActive(view: SidebarView) {
		if (view === 'home') return currentView === 'home' && Boolean(userDirs?.home) && currentPath === userDirs?.home;
		if (view === 'drives') {
			if (currentView === 'drives') return true;
			if (currentView !== 'home' || isDrivePath(currentPath, sidebarDrives)) return false;
			return isDrivePath(currentPath, drives);
		}
		return currentView === view;
	}

	function driveActive(drive: DriveInfo) {
		return currentView === 'home' && isDrivePath(currentPath, [drive]);
	}

	function primaryDropTarget(view: SidebarView) {
		if (view === 'home') return userDirs?.home ?? null;
		if (view === 'trash') return 'trash';
		return null;
	}

	function primaryDropKey(view: SidebarView) {
		const target = primaryDropTarget(view);
		if (!target) return null;
		return target === 'trash' ? scopedDropKey('sidebar', trashDropKey()) : sidebarDropKey(target);
	}

	function primaryDropping(view: SidebarView) {
		const key = primaryDropKey(view);
		return Boolean(key && dropTargetKey === key);
	}

	function handlePrimaryDragOver(event: DragEvent, view: SidebarView) {
		if (view === 'trash') {
			onTrashDragOver(event, primaryDropKey(view) ?? undefined);
			return;
		}
		const target = primaryDropTarget(view);
		if (target) onPathDragOver(event, target, primaryDropKey(view) ?? undefined);
	}

	function handlePrimaryDrop(event: DragEvent, view: SidebarView) {
		if (view === 'trash') {
			onTrashDrop(event);
			return;
		}
		const target = primaryDropTarget(view);
		if (target) onPathDrop(event, target);
	}

	function openPathWithMiddleClick(event: MouseEvent, path: string) {
		if (event.button !== 1) return;
		event.preventDefault();
		event.stopPropagation();
		onOpenPathInTab(path);
	}

	function openViewWithMiddleClick(event: MouseEvent, view: SidebarView) {
		if (event.button !== 1) return;
		event.preventDefault();
		event.stopPropagation();
		onOpenViewInTab(view);
	}

	function openBookmarkWithMiddleClick(event: MouseEvent, bookmark: PinnedFolder) {
		if (event.button !== 1) return;
		event.preventDefault();
		event.stopPropagation();
		onOpenBookmarkInTab(bookmark);
	}

	function hideDrive(event: MouseEvent, drive: DriveInfo) {
		event.stopPropagation();
		onHideDrive(drive.mount_point);
	}

	function ejectDrive(event: MouseEvent, drive: DriveInfo) {
		event.stopPropagation();
		onEjectDrive(drive);
	}

	function bookmarkIcon(bookmark: PinnedFolder): SidebarIcon {
		const icon = bookmark.icon;
		if (icon && ['monitor', 'download', 'file-text', 'image', 'music', 'video', 'archive', 'code', 'package'].includes(icon)) {
			return icon as SidebarIcon;
		}
		return bookmark.is_dir ? 'folder' : 'file';
	}

	function handleBookmarkDragOver(event: DragEvent) {
		if (draggingBookmarkPath) {
			event.preventDefault();
			bookmarkDropPath = null;
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
			return;
		}
		event.preventDefault();
		isBookmarkDropTarget = true;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	}

	function handleBookmarkDrop(event: DragEvent) {
		event.preventDefault();
		if (draggingBookmarkPath) {
			onReorderBookmarks(draggingBookmarkPath, null);
			draggingBookmarkPath = null;
			bookmarkDropPath = null;
			return;
		}
		isBookmarkDropTarget = false;
		onDropBookmark(event);
	}

	function handleBookmarkDragStart(event: DragEvent, path: string) {
		draggingBookmarkPath = path;
		event.dataTransfer?.setData('application/x-rover-bookmark', path);
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
	}

	function handleBookmarkRowDragOver(event: DragEvent, bookmark: PinnedFolder) {
		if (draggingBookmarkPath) {
			if (draggingBookmarkPath === bookmark.path) return;
			event.preventDefault();
			event.stopPropagation();
			bookmarkDropPath = bookmark.path;
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
			return;
		}
		if (bookmark.is_dir) onPathDragOver(event, bookmark.path, sidebarDropKey(bookmark.path));
	}

	function handleBookmarkRowDrop(event: DragEvent, bookmark: PinnedFolder) {
		if (draggingBookmarkPath) {
			if (draggingBookmarkPath === bookmark.path) return;
			event.preventDefault();
			event.stopPropagation();
			onReorderBookmarks(draggingBookmarkPath, bookmark.path);
			draggingBookmarkPath = null;
			bookmarkDropPath = null;
			return;
		}
		if (bookmark.is_dir) onPathDrop(event, bookmark.path);
	}

	function handleBookmarkDragEnd() {
		draggingBookmarkPath = null;
		bookmarkDropPath = null;
		isBookmarkDropTarget = false;
	}

	export function focusSearch() {
		searchInput?.focus();
		searchInput?.select();
	}
</script>

<aside
	class="rover-sidebar drag-region flex w-[260px] shrink-0 flex-col px-2.5 pb-4 pt-3"
	data-effect={backgroundEffect}
	data-window-drag
>
	<div class="px-0.5 pb-3 pt-1">
		<div
			class="sidebar-search flex h-11 items-center gap-3 rounded-full bg-[rgba(245,245,242,0.06)] px-3.5 text-[var(--text-muted)] shadow-[inset_0_1px_0_var(--hairline)] transition-[background-color,box-shadow,color] duration-150 ease-out hover:bg-[rgba(245,245,242,0.085)] hover:text-[var(--text)]"
			data-no-drag
		>
			<Icon name="search" size={17} />
			<input
				bind:this={searchInput}
				class="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
				type="search"
				value={searchQuery}
				placeholder="Search current folder"
				oninput={(event) => onSearch(event.currentTarget.value)}
			/>
		</div>
	</div>

	<nav class="flex flex-col gap-1 rounded-[18px] p-0.5" aria-label="Main locations" data-no-drag>
		{#each primaryNav as item (item.view)}
			<div class={rowStateClasses(primaryActive(item.view), primaryDropping(item.view))}>
				<button
					class="flex h-full min-w-0 flex-1 items-center gap-3 px-3 text-left"
					type="button"
					onclick={() => onSwitchView(item.view)}
					onauxclick={(event) => openViewWithMiddleClick(event, item.view)}
					ondragover={(event) => handlePrimaryDragOver(event, item.view)}
					ondragleave={onPathDragLeave}
					ondrop={(event) => handlePrimaryDrop(event, item.view)}
					data-drop-path={primaryDropTarget(item.view) && primaryDropTarget(item.view) !== 'trash'
						? primaryDropTarget(item.view)
						: undefined}
					data-drop-key={primaryDropKey(item.view) ?? undefined}
					data-drop-trash={primaryDropTarget(item.view) === 'trash' ? 'true' : undefined}
				>
					<Icon name={item.icon} size={19} />
					<span class="truncate">{item.label}</span>
				</button>
			</div>
		{/each}
	</nav>

	{#if sidebarDrives.length > 0}
		<div class="mx-1 my-3 h-px bg-[var(--hairline)]"></div>

		<nav class="flex flex-col gap-1 rounded-[18px] p-0.5" aria-label="External drives" data-no-drag>
			{#each sidebarDrives as drive (drive.mount_point)}
				<div class={rowStateClasses(driveActive(drive), dropTargetKey === sidebarDropKey(drive.mount_point))}>
					<button
						class="flex h-full min-w-0 flex-1 items-center gap-3 px-3 text-left"
						type="button"
						onclick={() => onNavigate(drive.mount_point)}
						onauxclick={(event) => openPathWithMiddleClick(event, drive.mount_point)}
						ondragover={(event) => onPathDragOver(event, drive.mount_point, sidebarDropKey(drive.mount_point))}
						ondragleave={onPathDragLeave}
						ondrop={(event) => onPathDrop(event, drive.mount_point)}
						data-drop-path={drive.mount_point}
						data-drop-key={sidebarDropKey(drive.mount_point)}
					>
						<Icon name="usb" size={19} />
						<span class="truncate">{drive.name}</span>
					</button>
					<button
						class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--text-muted)] opacity-0 transition-[background-color,color,opacity,transform] duration-150 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] group-hover:opacity-100 active:scale-[0.96]"
						type="button"
						aria-label={`Eject ${drive.name}`}
						onclick={(event) => ejectDrive(event, drive)}
					>
						<Icon name="eject" size={14} />
					</button>
					<button
						class="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--text-muted)] opacity-0 transition-[background-color,color,opacity,transform] duration-150 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] group-hover:opacity-100 active:scale-[0.96]"
						type="button"
						aria-label={`Hide ${drive.name} from sidebar`}
						onclick={(event) => hideDrive(event, drive)}
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
			'flex min-h-0 flex-col gap-1 overflow-y-auto rounded-[18px] p-0.5 soft-scroll transition-[background-color,box-shadow] duration-150',
			isBookmarkDropTarget ? 'bg-[var(--sidebar-active)] shadow-[inset_0_0_0_1px_var(--hairline)]' : ''
		]}
		aria-label="Bookmarks"
		data-no-drag
		ondragenter={handleBookmarkDragOver}
		ondragover={handleBookmarkDragOver}
		ondragleave={() => (isBookmarkDropTarget = false)}
		ondrop={handleBookmarkDrop}
	>
			{#each pinnedFolders as item (item.path)}
				<div
					class={[...locationClasses(item), bookmarkDropPath === item.path ? 'bg-[rgba(200,182,111,0.12)] shadow-[inset_0_1px_0_var(--hairline)]' : '']}
					draggable="true"
				ondragstart={(event) => handleBookmarkDragStart(event, item.path)}
				ondragover={(event) => handleBookmarkRowDragOver(event, item)}
				ondragleave={onPathDragLeave}
				ondrop={(event) => handleBookmarkRowDrop(event, item)}
				ondragend={handleBookmarkDragEnd}
				data-drop-path={item.is_dir ? item.path : undefined}
				data-drop-key={item.is_dir ? sidebarDropKey(item.path) : undefined}
				role="group"
			>
				<button
					class="flex h-full min-w-0 flex-1 items-center gap-3 px-3 text-left"
					type="button"
					onclick={() => onOpenBookmark(item)}
					onauxclick={(event) => openBookmarkWithMiddleClick(event, item)}
				>
					<Icon name={bookmarkIcon(item)} size={19} />
					<span class="truncate">{item.name}</span>
				</button>
				<button
					class="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--text-muted)] opacity-0 transition-[background-color,color,opacity,transform] duration-150 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] group-hover:opacity-100 active:scale-[0.96]"
					type="button"
					aria-label={`Remove ${item.name}`}
					onclick={() => onRemoveBookmark(item.path)}
				>
					<Icon name="x" size={14} />
				</button>
			</div>
		{/each}
	</nav>
</aside>
