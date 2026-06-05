<script lang="ts">
	import { onMount } from 'svelte';
	import AppHeader from '$lib/components/file-manager/AppHeader.svelte';
	import ChooserBar from '$lib/components/file-manager/ChooserBar.svelte';
	import ContextMenu from '$lib/components/file-manager/ContextMenu.svelte';
	import FilePane from '$lib/components/file-manager/FilePane.svelte';
	import OperationDock from '$lib/components/file-manager/OperationDock.svelte';
	import PathToolbar from '$lib/components/file-manager/PathToolbar.svelte';
	import Sidebar from '$lib/components/file-manager/Sidebar.svelte';
	import StatusBar from '$lib/components/file-manager/StatusBar.svelte';
	import VcsPanel from '$lib/components/file-manager/VcsPanel.svelte';
	import VcsSaveDialog from '$lib/components/file-manager/VcsSaveDialog.svelte';
	import * as api from '$lib/api';
	import { ensureSidebarBookmarks, entryToSidebarBookmark, mergeSidebarBookmarks } from '$lib/file-manager/bookmarks';
	import { dataTransferPaths } from '$lib/file-manager/drag-drop';
	import { FileManager } from '$lib/file-manager/manager.svelte';
	import { isDesktopRuntime } from '$lib/runtime';
	import { activeTab, clipboard, currentView, drives, selection, settings, tabs, userDirs } from '$lib/stores';
	import type { ChooserConfig, FavoriteItem, FileEntry, PinnedFolder, SidebarView, TrashLocation } from '$lib/types';
	import { VcsState } from '$lib/vcs/state.svelte';

	const manager = new FileManager();
	const vcs = new VcsState();
	let seededSidebarBookmarks = false;
	let chooser = $state<ChooserConfig | null>(null);
	let chooserSaveName = $state('');

	onMount(() => {
		void initialize();
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
	let chooserAcceptPaths = $derived.by(() => pathsForChooser());
	let chooserCanAccept = $derived(Boolean(chooser && chooserAcceptPaths.length > 0));
	let contextTargetIsPinned = $derived(
		Boolean(
			manager.contextMenu?.target &&
				$settings.pinnedFolders.some((bookmark) => bookmark.path === manager.contextMenu?.target?.path)
		)
	);
	let contextTargetVcsStatus = $derived.by(() => {
		const target = manager.contextMenu?.target;
		return target ? vcs.statusFor(target.path, target.is_dir) : null;
	});

	$effect(() => {
		if (!$userDirs || seededSidebarBookmarks) return;
		seededSidebarBookmarks = true;
		void settings.updateAndSave((current) => ensureSidebarBookmarks(current, $userDirs));
	});

	$effect(() => {
		if ($currentView === 'home' && !chooser && !manager.isLoading && manager.currentPath) vcs.open(manager.currentPath);
		else vcs.clear();
	});

	async function initialize() {
		if (isDesktopRuntime()) {
			try {
				const config = await api.getChooserConfig();
				if (config.active) {
					chooser = config;
					chooserSaveName = config.current_name ?? '';
				}
			} catch {
				chooser = null;
			}
		}
		await manager.init();
		if (chooser?.current_folder) await manager.navigate(chooser.current_folder);
	}

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
		if (chooser && !bookmark.is_dir && selectableChooserPath(false)) {
			await submitChooser([bookmark.path]);
			return;
		}
		if (bookmark.is_dir) await manager.navigate(bookmark.path);
		else await api.openWithDefault(bookmark.path);
	}

	function selectableChooserEntry(entry: FileEntry) {
		if (!chooser) return true;
		if (chooser.mode === 'save_files') return entry.is_dir;
		if (chooser.mode === 'save') return true;
		return chooser.directory ? entry.is_dir : entry.is_file;
	}

	function selectableChooserPath(isDir: boolean) {
		if (!chooser) return true;
		if (chooser.mode === 'save_files') return isDir;
		if (chooser.mode === 'save') return true;
		return chooser.directory ? isDir : !isDir;
	}

	function handleChooserSelectEntry(entry: FileEntry, event: MouseEvent) {
		if (!chooser) return manager.handleItemClick(entry, event);
		if (!selectableChooserEntry(entry) && !entry.is_dir) return;
		if ((event.ctrlKey || event.metaKey) && chooser.multiple && selectableChooserEntry(entry)) selection.toggle(entry.path);
		else selection.select(entry.path);
	}

	function handleChooserOpenEntry(entry: FileEntry) {
		if (!chooser) return manager.handleItemOpen(entry);
		if (entry.is_dir) {
			manager.navigate(entry.path);
			return;
		}
		if (selectableChooserEntry(entry)) {
			selection.select(entry.path);
			void submitChooser([entry.path]);
		}
	}

	async function handleChooserFavorite(favorite: FavoriteItem) {
		if (!chooser) return manager.openFavorite(favorite);
		if (favorite.is_dir) await manager.navigate(favorite.path);
		else if (selectableChooserPath(false)) await submitChooser([favorite.path]);
	}

	function handleChooserRange(paths: string[]) {
		if (!chooser) {
			selection.selectAll(paths);
			return;
		}
		const allowed = manager.entries.filter((entry) => paths.includes(entry.path) && selectableChooserEntry(entry)).map((entry) => entry.path);
		selection.selectAll(chooser.multiple ? allowed : allowed.slice(0, 1));
	}

	function pathsForChooser() {
		if (!chooser) return [];
		if (chooser.mode === 'save') {
			const name = chooserSaveName.trim();
			if (!name) return [];
			return [joinPath(manager.currentPath || chooser.current_folder || $userDirs?.home || '/', name)];
		}
		if (chooser.mode === 'save_files') {
			const folder = selectedChooserDirectories()[0] ?? manager.currentPath;
			if (!folder || chooser.files.length === 0) return [];
			return chooser.files.map((name) => joinPath(folder, name));
		}
		const paths = manager.entries.filter((entry) => $selection.has(entry.path) && selectableChooserEntry(entry)).map((entry) => entry.path);
		return chooser.multiple ? paths : paths.slice(0, 1);
	}

	function selectedChooserDirectories() {
		return manager.entries.filter((entry) => entry.is_dir && $selection.has(entry.path)).map((entry) => entry.path);
	}

	function joinPath(folder: string, name: string) {
		return `${folder.replace(/\/$/, '')}/${name.replace(/^\//, '')}`;
	}

	async function submitChooser(paths = chooserAcceptPaths) {
		if (!chooser || paths.length === 0) return;
		await api.acceptChooser(paths);
	}

	async function cancelChooser() {
		await api.cancelChooser();
	}

	function handleChooserKeydown(event: KeyboardEvent) {
		const target = event.target instanceof Element ? event.target : null;
		if (target?.closest('input, textarea, [contenteditable="true"]')) return;
		if (!chooser) return manager.handleKeydown(event);
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
			event.preventDefault();
			const allowed = manager.displayEntries.filter(selectableChooserEntry).map((entry) => entry.path);
			selection.selectAll(chooser.multiple ? allowed : allowed.slice(0, 1));
		}
		if (event.key === 'Enter' && chooserCanAccept) {
			event.preventDefault();
			void submitChooser();
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			void cancelChooser();
		}
		if (event.key === 'Backspace') manager.goUp();
	}

	async function switchChooserView(view: SidebarView) {
		if (chooser && view === 'trash') return;
		await manager.switchView(view);
	}

	function openVcsChanges(entry?: FileEntry) {
		if (!vcs.project) return;
		vcs.panelOpen = true;
		if (entry && !entry.is_dir) void vcs.loadDiff(vcs.relativePath(entry.path));
	}

	function openVcsSave(entry?: FileEntry) {
		if (!vcs.project) return;
		const file = entry && !entry.is_dir ? [vcs.relativePath(entry.path)] : undefined;
		vcs.openSaveDialog(file);
	}
</script>

<svelte:window
	onkeydown={handleChooserKeydown}
	onfocus={() => vcs.refreshNow()}
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
				onSwitchView={switchChooserView}
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
						vcsProject={vcs.project}
						chooserMode={Boolean(chooser)}
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
						onOpenVcs={() => openVcsChanges()}
					/>
				{/if}

				<div class="flex min-h-0 flex-1 overflow-hidden">
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
						canDrag={!chooser}
						allowSelectedDoubleClick={Boolean(chooser)}
						entryVcsStatus={(entry) => vcs.statusFor(entry.path, entry.is_dir)}
						onSelectEntry={handleChooserSelectEntry}
						onOpenEntry={handleChooserOpenEntry}
						onMiddleClick={chooser ? () => {} : manager.handleMiddleClick}
						onContextMenu={chooser ? (event) => event.preventDefault() : manager.handleContextMenu}
						onDragStart={chooser ? (event) => event.preventDefault() : manager.handleDragStart}
						onDragEnd={manager.handleDragEnd}
						onDragOver={chooser ? (event) => event.preventDefault() : manager.handleDragOver}
						onDragLeave={manager.handleDragLeave}
						onDrop={chooser ? (event) => event.preventDefault() : manager.handleDrop}
						onSort={manager.setSortBy}
						onNavigate={manager.navigate}
						onSelectRange={handleChooserRange}
						onDraftInput={manager.updateDraft}
						onDraftConfirm={manager.commitDraft}
						onDraftCancel={manager.cancelDraft}
						onOpenFavorite={handleChooserFavorite}
						onSelectTrashItem={(id) => selection.toggle(id)}
						onRestoreTrash={manager.restoreSelected}
						onEmptyTrash={manager.emptyTrash}
					/>
					<VcsPanel {vcs} />
				</div>

				{#if chooser}
					<ChooserBar
						config={chooser}
						{selectedCount}
						canAccept={chooserCanAccept}
						saveName={chooserSaveName}
						onSaveName={(value) => (chooserSaveName = value)}
						onAccept={() => submitChooser()}
						onCancel={cancelChooser}
					/>
				{:else}
					<StatusBar
						{itemCount}
						{selectedCount}
						{selectedSize}
						vcsProject={vcs.project}
						vcsBusy={vcs.busy}
						vcsMessage={vcs.lastResult}
						vcsError={vcs.error}
					/>
				{/if}
				<OperationDock />
			</section>
		</div>
	</main>
</div>

{#if manager.contextMenu && !chooser}
	<ContextMenu
		menu={manager.contextMenu}
		hasClipboard={$clipboard.items.length > 0}
		isFavorite={contextTargetIsFavorite}
		isPinned={contextTargetIsPinned}
		vcsProject={vcs.project}
		targetVcsStatus={contextTargetVcsStatus}
		onOpen={manager.handleItemOpen}
		onOpenInTab={(entry) => manager.openNewTab(entry.path)}
		onCut={manager.cut}
		onCopy={manager.copy}
		onRename={manager.startRename}
		onTrash={manager.deleteSelected}
		onToggleFavorite={manager.toggleFavorite}
		onTogglePinned={toggleSidebarBookmark}
		onViewVcsChanges={openVcsChanges}
		onSaveVcs={openVcsSave}
		onSyncVcs={() => vcs.sync()}
		onCreate={manager.startCreate}
		onPaste={manager.paste}
		onClose={() => (manager.contextMenu = null)}
	/>
{/if}

<VcsSaveDialog {vcs} />
