<script lang="ts">
	import { onMount } from 'svelte';
	import AppHeader from '$lib/components/file-manager/AppHeader.svelte';
	import ContextMenu from '$lib/components/file-manager/ContextMenu.svelte';
	import FilePane from '$lib/components/file-manager/FilePane.svelte';
	import OperationDock from '$lib/components/file-manager/OperationDock.svelte';
	import PathToolbar from '$lib/components/file-manager/PathToolbar.svelte';
	import Sidebar from '$lib/components/file-manager/Sidebar.svelte';
	import StatusBar from '$lib/components/file-manager/StatusBar.svelte';
	import * as api from '$lib/api';
	import { ensureSidebarBookmarks, entryToSidebarBookmark, mergeSidebarBookmarks } from '$lib/file-manager/bookmarks';
	import { dataTransferPaths } from '$lib/file-manager/drag-drop';
	import { FileManager } from '$lib/file-manager/manager.svelte';
	import { activeTab, clipboard, currentView, drives, selection, settings, tabs, userDirs } from '$lib/stores';
	import type { FileEntry, PinnedFolder, TrashLocation } from '$lib/types';

	const manager = new FileManager();
	let seededSidebarBookmarks = false;

	onMount(() => {
		manager.init();
		document.addEventListener('click', manager.closeFloatingUi);
		return () => document.removeEventListener('click', manager.closeFloatingUi);
	});

	let selectedCount = $derived($selection.size);
	let selectedSize = $derived.by(() =>
		manager.entries
			.filter((entry) => $selection.has(entry.path))
			.reduce((sum, entry) => sum + entry.size, 0)
	);
	let itemCount = $derived.by(() => {
		if ($currentView === 'trash') return manager.trashItems.length;
		if ($currentView === 'drives') return $drives.length;
		if ($currentView === 'favorites') return $settings.favorites.length;
		return manager.displayEntries.length;
	});
	let contextTargetIsFavorite = $derived(
		Boolean(
			manager.contextMenu?.target &&
				$settings.favorites.some((favorite) => favorite.path === manager.contextMenu?.target?.path)
		)
	);
	let trashLocations = $derived.by(() => {
		const locations = new Map<string, TrashLocation>();
		for (const item of manager.trashItems) {
			locations.set(item.trash_path, { id: item.trash_path, name: item.trash_name, path: item.trash_path });
		}
		return [...locations.values()];
	});
	let contextTargetIsPinned = $derived(
		Boolean(
			manager.contextMenu?.target &&
				$settings.pinnedFolders.some((bookmark) => bookmark.path === manager.contextMenu?.target?.path)
		)
	);

	$effect(() => {
		if (!$userDirs || seededSidebarBookmarks) return;
		seededSidebarBookmarks = true;
		void settings.updateAndSave((current) => ensureSidebarBookmarks(current, $userDirs));
	});

	function draggedSidebarEntries() {
		const entries = manager.entries.filter((entry) => $selection.has(entry.path));
		if (manager.dragTarget && !entries.some((entry) => entry.path === manager.dragTarget?.path)) return [manager.dragTarget, ...entries];
		return entries;
	}

	function droppedSidebarPaths(event: DragEvent) {
		const droppedPaths = dataTransferPaths(event.dataTransfer);
		if (droppedPaths.length > 0) return droppedPaths;
		return draggedSidebarEntries().map((entry) => entry.path);
	}

	async function pinBookmarksToSidebar(bookmarks: PinnedFolder[]) {
		if (bookmarks.length === 0) {
			manager.handleDragEnd();
			return;
		}
		await settings.updateAndSave((current) => ({
			...current,
			sidebarBookmarksInitialized: true,
			pinnedFolders: mergeSidebarBookmarks(current.pinnedFolders, bookmarks)
		}));
		manager.handleDragEnd();
	}

	async function bookmarkForPath(path: string) {
		const entry = manager.entries.find((item) => item.path === path) ?? (manager.dragTarget?.path === path ? manager.dragTarget : null);
		if (entry) return entryToSidebarBookmark(entry);
		try {
			return entryToSidebarBookmark(await api.getFileInfo(path));
		} catch {
			return null;
		}
	}

	async function pinEntriesToSidebar(entries: FileEntry[]) {
		await pinBookmarksToSidebar(entries.map(entryToSidebarBookmark));
	}

	async function pinPathsToSidebar(paths: string[]) {
		const bookmarks = (await Promise.all(paths.map(bookmarkForPath))).filter((item): item is PinnedFolder => Boolean(item));
		await pinBookmarksToSidebar(bookmarks);
	}

	async function removeSidebarBookmark(path: string) {
		await settings.updateAndSave((current) => ({
			...current,
			sidebarBookmarksInitialized: true,
			pinnedFolders: current.pinnedFolders.filter((bookmark) => bookmark.path !== path)
		}));
	}

	async function reorderSidebarBookmark(sourcePath: string, targetPath: string | null) {
		await settings.updateAndSave((current) => {
			const next = [...current.pinnedFolders];
			const sourceIndex = next.findIndex((bookmark) => bookmark.path === sourcePath);
			if (sourceIndex === -1) return current;
			const [bookmark] = next.splice(sourceIndex, 1);
			const targetIndex = targetPath ? next.findIndex((item) => item.path === targetPath) : next.length;
			next.splice(targetIndex === -1 ? next.length : targetIndex, 0, bookmark);
			return { ...current, sidebarBookmarksInitialized: true, pinnedFolders: next };
		});
	}

	async function toggleSidebarBookmark(entry: FileEntry) {
		const isPinned = $settings.pinnedFolders.some((bookmark) => bookmark.path === entry.path);
		if (isPinned) await removeSidebarBookmark(entry.path);
		else await pinEntriesToSidebar([entry]);
	}

	async function openSidebarBookmark(bookmark: PinnedFolder) {
		if (bookmark.is_dir) await manager.navigate(bookmark.path);
		else await api.openWithDefault(bookmark.path);
	}
</script>

<svelte:window
	onkeydown={manager.handleKeydown}
	onmousedown={manager.handleDragRegionMouseDown}
	onmouseup={manager.handleMouseButtonNavigation}
/>

<div class="h-[100dvh] w-screen min-w-[800px] overflow-hidden bg-transparent text-[var(--text)]">
	<main class="rover-shell h-full overflow-hidden" data-effect={manager.backgroundEffect}>
		<div class="flex h-full">
			<Sidebar
				currentView={$currentView}
				currentPath={manager.currentPath}
				searchQuery={manager.searchQuery}
				userDirs={$userDirs}
				pinnedFolders={$settings.pinnedFolders}
				drives={$drives}
				backgroundEffect={manager.backgroundEffect}
				onSearch={(value) => (manager.searchQuery = value)}
				onSwitchView={manager.switchView}
				onNavigate={manager.navigate}
				onOpenBookmark={openSidebarBookmark}
				onRemoveBookmark={removeSidebarBookmark}
				onReorderBookmarks={reorderSidebarBookmark}
				onDropBookmark={(event) => pinPathsToSidebar(droppedSidebarPaths(event))}
			/>

			<section class="content-pane relative flex min-w-0 flex-1 flex-col">
				<AppHeader
					tabs={$tabs}
					activeTab={$activeTab}
					currentView={$currentView}
					homePath={$userDirs?.home ?? null}
					onSwitchTab={manager.switchTab}
					onCloseTab={manager.closeTab}
					onOpenTab={() => manager.openNewTab()}
					onMinimize={manager.minimize}
					onToggleMaximize={manager.toggleMaximize}
					onCloseWindow={manager.closeWindow}
				/>

				{#if $currentView === 'home'}
					<PathToolbar
						pathSegments={manager.pathSegments}
						currentPath={manager.currentPath}
						homePath={$userDirs?.home ?? null}
						canGoBack={$activeTab ? tabs.canGoBack($activeTab) : false}
						canGoForward={$activeTab ? tabs.canGoForward($activeTab) : false}
						{selectedCount}
						hasClipboard={$clipboard.items.length > 0}
						viewMode={manager.viewMode}
						sortBy={manager.sortBy}
						sortAsc={manager.sortAsc}
						showHidden={$settings.showHidden}
						onBack={manager.goBack}
						onForward={manager.goForward}
						onUp={manager.goUp}
						onNavigate={manager.navigate}
						onCreate={manager.startCreate}
						onCut={manager.cut}
						onCopy={manager.copy}
						onPaste={manager.paste}
						onTrash={manager.deleteSelected}
						onToggleHidden={manager.toggleHidden}
						onSort={manager.setSortBy}
						onViewMode={manager.setViewMode}
					/>
				{/if}

				<FilePane
					currentView={$currentView}
					currentPath={manager.currentPath}
					entries={manager.displayEntries}
					favorites={$settings.favorites}
					trashItems={manager.trashItems}
					{trashLocations}
					drives={$drives}
					thumbnails={manager.thumbnails}
					draft={manager.inlineDraft}
					viewMode={manager.viewMode}
					selectedPaths={$selection}
					isLoading={manager.isLoading}
					error={manager.error}
					dropTarget={manager.dropTarget}
					isDragging={manager.isDragging}
					onSelectEntry={manager.handleItemClick}
					onOpenEntry={manager.handleItemOpen}
					onMiddleClick={manager.handleMiddleClick}
					onContextMenu={manager.handleContextMenu}
					onDragStart={manager.handleDragStart}
					onDragEnd={manager.handleDragEnd}
					onDragOver={manager.handleDragOver}
					onDragLeave={manager.handleDragLeave}
					onDrop={manager.handleDrop}
					onSort={manager.setSortBy}
					onNavigate={manager.navigate}
					onSelectRange={(paths) => selection.selectAll(paths)}
					onDraftInput={manager.updateDraft}
					onDraftConfirm={manager.commitDraft}
					onDraftCancel={manager.cancelDraft}
					onOpenFavorite={manager.openFavorite}
					onSelectTrashItem={(id) => selection.toggle(id)}
					onRestoreTrash={manager.restoreSelected}
					onEmptyTrash={manager.emptyTrash}
				/>

				<StatusBar {itemCount} {selectedCount} {selectedSize} />
				<OperationDock />
			</section>
		</div>
	</main>
</div>

{#if manager.contextMenu}
	<ContextMenu
		menu={manager.contextMenu}
		hasClipboard={$clipboard.items.length > 0}
		isFavorite={contextTargetIsFavorite}
		isPinned={contextTargetIsPinned}
		onOpen={manager.handleItemOpen}
		onOpenInTab={(entry) => manager.openNewTab(entry.path)}
		onCut={manager.cut}
		onCopy={manager.copy}
		onRename={manager.startRename}
		onTrash={manager.deleteSelected}
		onToggleFavorite={manager.toggleFavorite}
		onTogglePinned={toggleSidebarBookmark}
		onCreate={manager.startCreate}
		onPaste={manager.paste}
		onClose={() => (manager.contextMenu = null)}
	/>
{/if}
