<script lang="ts">
	import { onMount } from 'svelte';
	import AppHeader from '$lib/components/file-manager/AppHeader.svelte';
	import ChooserBar from '$lib/components/file-manager/ChooserBar.svelte';
	import ContextMenu from '$lib/components/file-manager/ContextMenu.svelte';
	import FilePane from '$lib/components/file-manager/FilePane.svelte';
	import OperationDock from '$lib/components/file-manager/OperationDock.svelte';
	import PathToolbar from '$lib/components/file-manager/PathToolbar.svelte';
	import Portal from '$lib/components/Portal.svelte';
	import Sidebar from '$lib/components/file-manager/Sidebar.svelte';
	import StatusBar from '$lib/components/file-manager/StatusBar.svelte';
	import VcsPanel from '$lib/components/file-manager/VcsPanel.svelte';
	import VcsSaveDialog from '$lib/components/file-manager/VcsSaveDialog.svelte';
	import * as api from '$lib/api';
	import { ensureSidebarBookmarks, entryToSidebarBookmark, mergeSidebarBookmarks } from '$lib/file-manager/bookmarks';
	import { dataTransferPaths } from '$lib/file-manager/drag-drop';
	import { tabDropKey, type DropTarget } from '$lib/file-manager/drop-targets';
	import { FileManager } from '$lib/file-manager/manager.svelte';
	import type { SingleInstanceActivation } from '$lib/file-manager/open-targets';
	import { isDrivePath } from '$lib/file-manager/view-modes';
	import { isDesktopRuntime } from '$lib/runtime';
	import { activeTab, clipboard, currentView, drives, loadDrives, selection, settings, tabs, userDirs } from '$lib/stores';
	import type { ChooserConfig, DriveInfo, FavoriteItem, FileEntry, PinnedFolder, SidebarView, Tab, TrashLocation } from '$lib/types';
	import { VcsState } from '$lib/vcs/state.svelte';

	const manager = new FileManager();
	const vcs = new VcsState();
	let seededSidebarBookmarks = false;
	let chooser = $state<ChooserConfig | null>(null);
	let chooserSaveName = $state('');
	let sidebar: { focusSearch: () => void } | null = null;
	let hiddenSidebarDriveMounts = $state<string[]>([]);
	let ejectingDriveMounts = $state<string[]>([]);
	let dragHoverTabId: string | null = null;
	let dragHoverTabTimer: number | null = null;

	onMount(() => {
		let disposed = false;
		let removeSingleInstanceListener: (() => void) | null = null;
		let driveRefreshTimer: number | null = null;
		void initialize();
		document.addEventListener('click', manager.closeFloatingUi);
		if (isDesktopRuntime()) {
			driveRefreshTimer = window.setInterval(() => void loadDrives(), 5000);
			void api
				.listenBridgeEvent<SingleInstanceActivation>('singleInstance.activate', (activation) => {
					void manager.openSingleInstanceActivation(activation);
				})
				.then((cleanup) => {
					if (disposed) cleanup();
					else removeSingleInstanceListener = cleanup;
				})
				.catch(() => {});
		}
		return () => {
			disposed = true;
			clearDragHoverTab();
			document.removeEventListener('click', manager.closeFloatingUi);
			if (driveRefreshTimer !== null) window.clearInterval(driveRefreshTimer);
			removeSingleInstanceListener?.();
		};
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
	let sidebarDrives = $derived.by(() =>
		$drives.filter((drive) => drive.is_removable && !hiddenSidebarDriveMounts.includes(drive.mount_point))
	);
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
		if ($currentView !== 'home' || chooser) {
			vcs.clear();
			return;
		}
		if (!manager.currentPath || manager.isLoading) return;
		vcs.open(manager.currentPath, manager.entries);
	});

	async function readChooserConfig() {
		for (let attempt = 0; attempt < 3; attempt += 1) {
			try {
				const config = await api.getChooserConfig();
				return config;
			} catch (error) {
				if (attempt === 2) throw error;
				await new Promise((resolve) => window.setTimeout(resolve, 250 + attempt * 250));
			}
		}
		throw new Error('Rover chooser config unavailable');
	}

	async function initialize() {
		let launchPaths: string[] = [];
		if (isDesktopRuntime()) {
			try {
				const config = await readChooserConfig();
				if (config.active) {
					chooser = config;
					chooserSaveName = config.current_name ?? '';
				}
			} catch (caught) {
				console.error('Rover chooser config failed to load:', caught);
				chooser = null;
			}
			try {
				launchPaths = await api.getLaunchPaths();
			} catch {
				launchPaths = [];
			}
		}
		const startPath = chooser?.current_folder ?? undefined;
		await manager.init(startPath);
		if (chooser?.current_folder) {
			// Already navigated by manager.init
		} else if (launchPaths.length > 0) {
			await manager.openLaunchPaths(launchPaths);
		}
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

	function hideSidebarDrive(mountPoint: string) {
		if (hiddenSidebarDriveMounts.includes(mountPoint)) return;
		hiddenSidebarDriveMounts = [...hiddenSidebarDriveMounts, mountPoint];
	}

	function driveIsEjecting(mountPoint: string) {
		return ejectingDriveMounts.includes(mountPoint);
	}

	function setDriveEjecting(mountPoint: string, ejecting: boolean) {
		if (ejecting) {
			if (!ejectingDriveMounts.includes(mountPoint)) ejectingDriveMounts = [...ejectingDriveMounts, mountPoint];
			return;
		}
		ejectingDriveMounts = ejectingDriveMounts.filter((item) => item !== mountPoint);
	}

	function wait(ms: number) {
		return new Promise((resolve) => window.setTimeout(resolve, ms));
	}

	async function refreshDrivesUntilUnmounted(mountPoint: string) {
		for (const delay of [0, 300, 900, 1800, 3000, 5000, 8000, 12000]) {
			if (delay > 0) await wait(delay);
			const mountedDrives = await loadDrives();
			if (!mountedDrives.some((item) => item.mount_point === mountPoint)) return true;
		}
		return false;
	}

	async function ejectDrive(drive: DriveInfo) {
		if (driveIsEjecting(drive.mount_point)) return;
		setDriveEjecting(drive.mount_point, true);
		try {
			await api.ejectDrive(drive.mount_point);
			const unmounted = await refreshDrivesUntilUnmounted(drive.mount_point);
			if (unmounted && $currentView === 'home' && isDrivePath(manager.currentPath, [drive])) {
				await manager.navigate($userDirs?.home ?? '/');
			}
		} catch (caught) {
			manager.error = caught instanceof Error ? caught.message : String(caught);
			await loadDrives();
		} finally {
			setDriveEjecting(drive.mount_point, false);
		}
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

	async function openSidebarBookmarkInTab(bookmark: PinnedFolder) {
		if (bookmark.is_dir) await manager.openNewTab(bookmark.path);
		else await api.openWithDefault(bookmark.path);
	}

	function handleTabDragOver(event: DragEvent, tab: Tab) {
		if (tab.view === 'home') return manager.handlePathDragOver(event, tab.path, tabDropKey(tab.id));
		if (tab.view === 'trash') {
			const accepted = manager.handleTrashDragOver(event);
			if (accepted) manager.setDropTarget({ path: 'trash', key: tabDropKey(tab.id), tabId: tab.id });
			return accepted;
		}
		return false;
	}

	function canDropOnPathBar(path: string) {
		if (chooser) return false;
		return manager.canAcceptExternalDrop(path);
	}

	function handleTabDrop(event: DragEvent, tab: Tab) {
		if (tab.view === 'home') {
			void manager.handleDrop(event, tab.path);
			return;
		}
		if (tab.view === 'trash') void manager.handleTrashDrop(event);
	}

	function clearDragHoverTab() {
		if (dragHoverTabTimer !== null) {
			window.clearTimeout(dragHoverTabTimer);
			dragHoverTabTimer = null;
		}
		dragHoverTabId = null;
	}

	function scheduleDragHoverTab(tabId: string | null) {
		if (!tabId || tabId === $activeTab?.id) {
			clearDragHoverTab();
			return;
		}
		if (dragHoverTabId === tabId) return;
		clearDragHoverTab();
		dragHoverTabId = tabId;
		dragHoverTabTimer = window.setTimeout(() => {
			dragHoverTabTimer = null;
			const tab = $tabs.find((item) => item.id === tabId);
			if (tab && $activeTab?.id !== tab.id) void manager.switchTab(tab.id);
		}, 450);
	}

	function handleInternalDragMove(target: DropTarget | null) {
		manager.updateInternalDropTarget(target);
		scheduleDragHoverTab(target?.tabId ?? null);
	}

	function handleInternalDragEnd(targetPath: string | null, copy: boolean) {
		clearDragHoverTab();
		void manager.finishInternalDrop(targetPath, copy);
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
		const acceptPaths = paths.slice();
		chooser = null;
		void api.acceptChooser(acceptPaths).catch((error) => {
			console.error('Rover chooser accept failed:', error);
		});
	}

	async function cancelChooser() {
		chooser = null;
		void api.cancelChooser().catch((error) => {
			console.error('Rover chooser cancel failed:', error);
		});
	}

	function handleChooserKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'f') {
			event.preventDefault();
			sidebar?.focusSearch();
			return;
		}
		if (event.key === 'F5') {
			event.preventDefault();
			void manager.refresh();
			return;
		}
		if (event.key === 'F2' || event.code === 'F2') {
			if (!chooser) {
				manager.handleKeydown(event);
				return;
			}
			return;
		}
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

	function toggleVcsPanel() {
		if (!vcs.project) return;
		vcs.panelOpen = !vcs.panelOpen;
	}

	function openVcsSave(entry?: FileEntry) {
		if (!vcs.project) return;
		const file = entry && !entry.is_dir ? [vcs.relativePath(entry.path)] : undefined;
		vcs.openSaveDialog(file);
	}

	function handleWindowFocus() {
		vcs.refreshNow();
		void loadDrives();
	}
</script>

<svelte:window
	onkeydown={handleChooserKeydown}
	onfocus={handleWindowFocus}
	onmousedown={manager.handleDragRegionMouseDown}
	onmouseup={manager.handleMouseButtonNavigation}
/>

<div class="h-[100dvh] w-screen min-w-[800px] overflow-hidden bg-transparent text-[var(--text)]">
	<main class="rover-shell h-full overflow-hidden" data-effect={manager.backgroundEffect}>
		<div class="flex h-full">
			<Sidebar
				bind:this={sidebar}
				currentView={$currentView}
				currentPath={manager.currentPath}
				searchQuery={manager.searchQuery}
				userDirs={$userDirs}
				pinnedFolders={$settings.pinnedFolders}
				drives={$drives}
				{sidebarDrives}
				{ejectingDriveMounts}
				dropTargetKey={manager.dropTargetKey}
				backgroundEffect={manager.backgroundEffect}
				onSearch={(value) => (manager.searchQuery = value)}
				onSwitchView={switchChooserView}
				onNavigate={manager.navigate}
				onOpenPathInTab={manager.openNewTab}
				onOpenViewInTab={manager.openViewInNewTab}
				onOpenBookmark={openSidebarBookmark}
				onOpenBookmarkInTab={openSidebarBookmarkInTab}
				onRemoveBookmark={removeSidebarBookmark}
				onHideDrive={hideSidebarDrive}
				onEjectDrive={ejectDrive}
				onPathDragOver={manager.handlePathDragOver}
				onPathDrop={manager.handleDrop}
				onPathDragLeave={manager.handleDragLeave}
				onTrashDragOver={manager.handleTrashDragOver}
				onTrashDrop={manager.handleTrashDrop}
				onReorderBookmarks={reorderSidebarBookmark}
				onDropBookmark={(event) => pinPathsToSidebar(droppedSidebarPaths(event))}
			/>

			<section class="content-pane relative flex min-w-0 flex-1 flex-col">
				<AppHeader
					tabs={$tabs}
					activeTab={$activeTab}
					homePath={$userDirs?.home ?? null}
					dropTargetKey={manager.dropTargetKey}
					onSwitchTab={manager.switchTab}
					onCloseTab={manager.closeTab}
					onOpenTab={() => manager.openNewTab()}
					onTabDragOver={handleTabDragOver}
					onTabDrop={handleTabDrop}
					onTabDragLeave={manager.handleDragLeave}
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
						dropTargetKey={manager.dropTargetKey}
						canDropOnPath={canDropOnPathBar}
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
						onOpenVcs={toggleVcsPanel}
						onPathDragOver={(event, path) => manager.handlePathDragOver(event, path, `pathbar:${path}`)}
						onPathDrop={manager.handleDrop}
						onPathDragLeave={manager.handleDragLeave}
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
						{ejectingDriveMounts}
						thumbnails={manager.thumbnails}
						draft={manager.inlineDraft}
						viewMode={manager.viewMode}
						selectedPaths={$selection}
						cuttingPaths={manager.cuttingPaths}
						showLoadingSkeleton={manager.showLoadingSkeleton}
						error={manager.error}
						dropTargetKey={manager.dropTargetKey}
						isDragging={manager.isDragging}
						canDrag={!chooser}
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
						onPathDragOver={chooser ? () => false : manager.handlePathDragOver}
						onInternalDragStart={manager.beginInternalDrag}
						onInternalDragMove={handleInternalDragMove}
						onInternalDragEnd={handleInternalDragEnd}
						onSort={manager.setSortBy}
						onNavigate={manager.navigate}
						onOpenPathInTab={manager.openNewTab}
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
				<Portal>
					<OperationDock />
				</Portal>
			</section>
		</div>
	</main>
</div>

{#if manager.contextMenu && !chooser}
	<Portal>
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
	</Portal>
{/if}

<Portal>
	<VcsSaveDialog {vcs} />
</Portal>
