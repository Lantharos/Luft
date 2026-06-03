<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { isDrivePath } from '$lib/file-manager/view-modes';
	import type { DriveInfo, PinnedFolder, SidebarView, UserDirs } from '$lib/types';

	interface Props {
		currentView: SidebarView;
		currentPath: string;
		searchQuery: string;
		userDirs: UserDirs | null;
		pinnedFolders: PinnedFolder[];
		drives: DriveInfo[];
		backgroundEffect: 'translucent' | 'opaque';
		onSearch: (value: string) => void;
		onSwitchView: (view: SidebarView) => void;
		onNavigate: (path: string) => void;
		onOpenBookmark: (bookmark: PinnedFolder) => void;
		onRemoveBookmark: (path: string) => void;
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
		backgroundEffect,
		onSearch,
		onSwitchView,
		onNavigate,
		onOpenBookmark,
		onRemoveBookmark,
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

	const primaryNav = [
		{ view: 'home', label: 'Home', icon: 'home' },
		{ view: 'favorites', label: 'Favorites', icon: 'star' },
		{ view: 'drives', label: 'Drives', icon: 'hard-drive' },
		{ view: 'trash', label: 'Trash', icon: 'trash' }
	] as const;

	function rowStateClasses(active: boolean) {
		return [
			'group flex h-11 w-full items-center rounded-full text-left text-[16px] transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.96]',
			active
				? 'bg-[var(--sidebar-active)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
				: 'text-[var(--text-soft)] hover:bg-[var(--sidebar-active)] hover:text-[var(--text)] hover:shadow-[inset_0_1px_0_var(--hairline)]'
		];
	}

	function bookmarkRowClasses(active: boolean) {
		return rowStateClasses(active);
	}

	function locationClasses(path: string) {
		return bookmarkRowClasses(currentView === 'home' && currentPath === path);
	}

	function primaryActive(view: SidebarView) {
		if (view === 'home') return currentView === 'home' && Boolean(userDirs?.home) && currentPath === userDirs?.home;
		if (view === 'drives') return currentView === 'drives' || (currentView === 'home' && isDrivePath(currentPath, drives));
		return currentView === view;
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

	function handleBookmarkRowDragOver(event: DragEvent, path: string) {
		if (!draggingBookmarkPath || draggingBookmarkPath === path) return;
		event.preventDefault();
		event.stopPropagation();
		bookmarkDropPath = path;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	function handleBookmarkRowDrop(event: DragEvent, path: string) {
		if (!draggingBookmarkPath || draggingBookmarkPath === path) return;
		event.preventDefault();
		event.stopPropagation();
		onReorderBookmarks(draggingBookmarkPath, path);
		draggingBookmarkPath = null;
		bookmarkDropPath = null;
	}

	function handleBookmarkDragEnd() {
		draggingBookmarkPath = null;
		bookmarkDropPath = null;
		isBookmarkDropTarget = false;
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
			<div class={rowStateClasses(primaryActive(item.view))}>
				<button class="flex h-full min-w-0 flex-1 items-center gap-3 px-3 text-left" type="button" onclick={() => onSwitchView(item.view)}>
					<Icon name={item.icon} size={19} />
					<span class="truncate">{item.label}</span>
				</button>
			</div>
		{/each}
	</nav>

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
				class={[...locationClasses(item.path), bookmarkDropPath === item.path ? 'shadow-[inset_0_0_0_1px_var(--accent)]' : '']}
				draggable="true"
				ondragstart={(event) => handleBookmarkDragStart(event, item.path)}
				ondragover={(event) => handleBookmarkRowDragOver(event, item.path)}
				ondrop={(event) => handleBookmarkRowDrop(event, item.path)}
				ondragend={handleBookmarkDragEnd}
				role="group"
			>
				<button class="flex h-full min-w-0 flex-1 items-center gap-3 px-3 text-left" type="button" onclick={() => onOpenBookmark(item)}>
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
