import { get } from 'svelte/store';
import * as api from '$lib/api';
import { closeWindow, fileSource, isDesktopRuntime, minimizeWindow, startWindowDrag, toggleMaximizeWindow } from '$lib/runtime';
import {
	activeTab,
	clearClipboard,
	clipboard,
	copyToClipboard,
	currentView,
	cutToClipboard,
	drives,
	loadDrives,
	loadUserDirs,
	selection,
	settings,
	tabs,
	userDirs
} from '$lib/stores';
import { dataTransferHasPaths, dataTransferPaths, setFileDragData } from '$lib/file-manager/drag-drop';
import { dropTargetKeyForPath, type DropTarget, trashDropKey } from '$lib/file-manager/drop-targets';
import { sortedEntries, visibleEntries } from '$lib/file-manager/entries';
import { DelayedLoading } from '$lib/file-manager/loading.svelte';
import { openExternalTargets, pathsFromActivation, type SingleInstanceActivation } from '$lib/file-manager/open-targets';
import { previewDrives, previewEntries, previewThumbnails, previewTrash, previewUserDirs } from '$lib/file-manager/preview';
import { handleShortcut, isTextInputTarget } from '$lib/file-manager/shortcuts';
import { thumbnailCandidates } from '$lib/file-manager/thumbnails';
import { normalizePath, viewModeForPath } from '$lib/file-manager/view-modes';
import type { BackgroundEffect, FavoriteItem, FileEntry, InlineDraft, SidebarView, SortBy, Tab, TabHistoryEntry, TrashItem, ViewMode } from '$lib/types';
import { getParentPath, getPathSegments } from '$lib/utils';
export type ContextMenuState = { x: number; y: number; target: FileEntry | null };
export type ToastTone = 'info' | 'success' | 'error';
export interface ToastMessage {
	id: number;
	text: string;
	tone: ToastTone;
}
const EMPTY_PATH_SET: Set<string> = new Set();
export class FileManager {
	entries = $state<FileEntry[]>([]);
	trashItems = $state<TrashItem[]>([]);
	currentPath = $state('');
	loading = new DelayedLoading();
	error = $state<string | null>(null);
	searchQuery = $state('');
	inlineDraft = $state<InlineDraft | null>(null);
	viewMode = $state<ViewMode>('list');
	sortBy = $state<SortBy>('name');
	sortAsc = $state(true);
	contextMenu = $state<ContextMenuState | null>(null);
	dragTarget = $state<FileEntry | null>(null);
	dropTarget = $state<string | null>(null);
	dropTargetKey = $state<string | null>(null);
	dragPaths = $state<string[]>([]);
	dropCommitted = $state(false);
	isDragging = $state(false);
	backgroundEffect = $state<BackgroundEffect>('opaque');
	thumbnails = $state<Record<string, string | null>>({});
	cuttingPaths = $state<Set<string>>(EMPTY_PATH_SET);
	toasts = $state<ToastMessage[]>([]);
	private clipboardUnsub: (() => void) | null = null;
	private nextToastId = 1;
	private toastTimers = new Map<number, ReturnType<typeof setTimeout>>();
	lastMouseNavButton = 0;
	lastMouseNavAt = 0;
	get displayEntries() { return visibleEntries(sortedEntries(this.entries, this.sortBy, this.sortAsc), this.searchQuery); }
	get isLoading() { return this.loading.active; }
	get showLoadingSkeleton() { return this.loading.skeleton; }
	get pathSegments() { return getPathSegments(this.currentPath); }
	private showToast(text: string, tone: ToastTone = 'info', durationMs = 2400) {
		const id = this.nextToastId++;
		this.toasts = [...this.toasts, { id, text, tone }];
		const timer = setTimeout(() => this.dismissToast(id), durationMs);
		this.toastTimers.set(id, timer);
	}
	dismissToast(id: number) {
		const timer = this.toastTimers.get(id);
		if (timer) {
			clearTimeout(timer);
			this.toastTimers.delete(id);
		}
		this.toasts = this.toasts.filter((toast) => toast.id !== id);
	}
	private setError(message: string) {
		this.error = message;
		this.showToast(message, 'error', 3600);
	}
	private basename(path: string) {
		return path.split('/').filter(Boolean).pop() ?? path;
	}
	init = async (startPathOverride?: string) => {
		this.subscribeClipboard();
		if (!isDesktopRuntime()) return this.initPreview(startPathOverride);
		const settingsTask = settings.load();
		const dirsTask = loadUserDirs();
		void loadDrives();
		void this.loadBackgroundEffectStatus();
		await settingsTask;
		const savedSettings = get(settings);
		this.sortBy = savedSettings.sortBy;
		this.sortAsc = savedSettings.sortAsc;
		const dirs = await dirsTask;
		const startPath = startPathOverride || dirs?.home || '/';
		await tabs.init(startPath);
		await this.loadDirectory(startPath);
	};
	private subscribeClipboard = () => {
		if (this.clipboardUnsub) return;
		this.updateCuttingPaths(get(clipboard));
		this.clipboardUnsub = clipboard.subscribe((value) => this.updateCuttingPaths(value));
	};
	private updateCuttingPaths = (clip: { operation: 'copy' | 'cut' | null; items: { path: string }[] }) => {
		if (clip.operation !== 'cut') {
			this.cuttingPaths = EMPTY_PATH_SET;
			return;
		}
		const next = new Set<string>();
		for (const item of clip.items) next.add(item.path);
		this.cuttingPaths = next;
	};
	initPreview = async (startPathOverride?: string) => {
		userDirs.set(previewUserDirs);
		drives.set(previewDrives);
		const startPath = startPathOverride || previewUserDirs.home;
		await tabs.init(startPath);
		this.loadPreviewDirectory(startPath);
	};
	loadPreviewDirectory(path: string) {
		this.loading.cancel();
		const entries = previewEntries(path);
		this.entries = entries;
		this.thumbnails = { ...this.thumbnails, ...previewThumbnails(entries) };
		this.currentPath = path;
		this.viewMode = viewModeForPath(path, get(settings), get(userDirs));
		this.searchQuery = '';
		this.inlineDraft = null;
		selection.clear();
		currentView.set('home');
	}
	closeFloatingUi = () => { this.contextMenu = null; };
	minimize = async () => { minimizeWindow(); };
	toggleMaximize = async () => { toggleMaximizeWindow(); };
	closeWindow = async () => { closeWindow(); };
	loadBackgroundEffectStatus = async () => {
		try {
			const status = await api.getBackgroundEffectStatus();
			this.backgroundEffect = status.background_effect;
		} catch {
			this.backgroundEffect = 'opaque';
		}
	};
	startDrag = async (event: MouseEvent) => {
		if (event.button !== 0) return;
		const target = event.target instanceof Element ? event.target : null;
		if (!target) return;
		if (target.closest('button, input, a, [data-no-drag]')) return;
		event.preventDefault();
		event.stopPropagation();
		startWindowDrag();
	};
	handleDragRegionMouseDown = (event: MouseEvent) => {
		const target = event.target instanceof Element ? event.target : null;
		if (!target?.closest('.drag-region, [data-window-drag]')) return;
		this.startDrag(event);
	};
	rememberPath = async (path: string) => {
		await settings.updateAndSave((current) => ({
			...current,
			recentPaths: [path, ...current.recentPaths.filter((item) => item !== path)].slice(0, 12)
		}));
	};
	loadDirectory = async (path: string) => {
		if (!isDesktopRuntime()) {
			this.loadPreviewDirectory(path);
			return;
		}
		const loading = this.loading.start();
		this.error = null;
		try {
			const result = await api.listDirectory(path, get(settings).showHidden);
			if (!this.loading.isCurrent(loading)) return;
			this.currentPath = result.path;
			this.viewMode = viewModeForPath(result.path, get(settings), get(userDirs));
			this.entries = result.entries;
			void this.loadThumbnails(result.entries);
			this.searchQuery = '';
			this.inlineDraft = null;
			selection.clear();
			currentView.set('home');
			await this.rememberPath(result.path);
		} catch (caught) {
			if (!this.loading.isCurrent(loading)) return;
			this.error = caught instanceof Error ? caught.message : String(caught);
			this.currentPath = path;
			this.viewMode = viewModeForPath(path, get(settings), get(userDirs));
			this.entries = [];
		} finally {
			this.loading.finish(loading);
		}
	};
	loadThumbnails = async (entries: FileEntry[]) => {
		const pending = thumbnailCandidates(entries).filter((entry) => this.thumbnails[entry.path] === undefined);
		if (pending.length === 0) return;
		const loadedEntries = await Promise.all(
			pending.map(async (entry) => {
				try {
					const thumbnailPath = await api.getThumbnail(entry.path);
					return [entry.path, thumbnailPath ? fileSource(thumbnailPath) : null] as const;
				} catch {
					return [entry.path, null] as const;
				}
			})
		);
		this.thumbnails = { ...this.thumbnails, ...Object.fromEntries(loadedEntries) };
	};
	restoreTabView = async (tab: Tab) => {
		await this.restoreHistoryEntry(tab);
	};
	restoreHistoryEntry = async (entry: Pick<TabHistoryEntry, 'path' | 'view'>) => {
		this.contextMenu = null;
		this.searchQuery = '';
		this.inlineDraft = null;
		selection.clear();
		this.currentPath = entry.path;
		currentView.set(entry.view);
		if (entry.view === 'home') {
			await this.loadDirectory(entry.path);
			return;
		}
		this.loading.cancel();
		this.error = null;
		if (entry.view === 'drives') await loadDrives();
		if (entry.view === 'favorites') selection.clear();
		if (entry.view === 'trash') await this.loadTrash();
	};
	loadTrash = async () => {
		if (!isDesktopRuntime()) {
			this.loading.cancel();
			this.trashItems = previewTrash;
			selection.clear();
			return;
		}
		const loading = this.loading.start();
		this.error = null;
		try {
			const result = await api.listTrash();
			if (!this.loading.isCurrent(loading)) return;
			this.trashItems = result.items;
			selection.clear();
		} catch (caught) {
			if (!this.loading.isCurrent(loading)) return;
			this.error = caught instanceof Error ? caught.message : String(caught);
			this.trashItems = [];
		} finally {
			this.loading.finish(loading);
		}
	};
	navigate = async (path: string) => {
		const tab = get(activeTab);
		if (tab) tabs.navigate(tab.id, path, path.split('/').filter(Boolean).at(-1) || 'Home');
		await this.loadDirectory(path);
	};
	switchView = async (view: SidebarView) => {
		this.contextMenu = null;
		this.searchQuery = '';
		selection.clear();
		currentView.set(view);
		const tab = get(activeTab);
		if (view !== 'home') {
			this.loading.cancel();
			this.error = null;
		}
		if (view === 'home') await this.navigate(get(userDirs)?.home || this.currentPath || '/');
		if (view === 'drives') {
			if (tab) tabs.navigateView(tab.id, view, this.currentPath || get(userDirs)?.home || '/', 'Drives');
			await loadDrives();
		}
		if (view === 'favorites') {
			if (tab) tabs.navigateView(tab.id, view, this.currentPath || get(userDirs)?.home || '/', 'Favorites');
		}
		if (view === 'trash') {
			if (tab) tabs.navigateView(tab.id, view, this.currentPath || get(userDirs)?.home || '/', 'Trash');
			await this.loadTrash();
		}
	};
	openFavorite = async (favorite: FavoriteItem) => {
		if (favorite.is_dir) await this.navigate(favorite.path);
		else await api.openWithDefault(favorite.path);
	};
	goBack = () => {
		const tab = get(activeTab);
		if (!tab || !tabs.canGoBack(tab)) return;
		const entry = tabs.goBack(tab.id);
		if (entry) this.restoreHistoryEntry(entry);
	};
	goForward = () => {
		const tab = get(activeTab);
		if (!tab || !tabs.canGoForward(tab)) return;
		const entry = tabs.goForward(tab.id);
		if (entry) this.restoreHistoryEntry(entry);
	};
	refresh = async () => {
		if (get(currentView) === 'home') {
			await this.loadDirectory(this.currentPath || get(userDirs)?.home || '/');
			return;
		}
		if (get(currentView) === 'drives') await loadDrives();
		if (get(currentView) === 'trash') await this.loadTrash();
	};
	goUp = () => {
		if (!this.currentPath || this.currentPath === '/') return;
		this.navigate(getParentPath(this.currentPath));
	};
	openNewTab = async (path?: string) => {
		const nextPath = path || this.currentPath || get(userDirs)?.home || '/';
		tabs.addTab(nextPath, nextPath.split('/').filter(Boolean).at(-1) || 'Home');
		await this.loadDirectory(nextPath);
	};
	openViewInNewTab = async (view: SidebarView) => {
		if (view === 'home') {
			await this.openNewTab(get(userDirs)?.home || this.currentPath || '/');
			return;
		}
		const path = this.currentPath || get(userDirs)?.home || '/';
		const title = view[0].toUpperCase() + view.slice(1);
		const tab = tabs.addTab(path, title, view);
		await this.restoreTabView(tab);
	};
	openLaunchPaths = (paths: string[]) =>
		openExternalTargets(paths, true, (folder, replaceActive) => (replaceActive ? this.navigate(folder) : this.openNewTab(folder)));
	openSingleInstanceActivation = (activation: SingleInstanceActivation) =>
		openExternalTargets(pathsFromActivation(activation), false, (folder) => this.openNewTab(folder));
	closeTab = (id: string) => {
		if (get(tabs).length <= 1) return void this.closeWindow();
		const wasActive = get(activeTab)?.id === id;
		tabs.closeTab(id);
		const nextActive = get(activeTab);
		if (wasActive && nextActive) this.restoreTabView(nextActive);
	};
	switchTab = (id: string) => {
		tabs.setActiveTab(id);
		const tab = get(tabs).find((item) => item.id === id);
		if (tab) this.restoreTabView(tab);
	};
	setSortBy = async (nextSort: SortBy) => {
		if (this.sortBy === nextSort) this.sortAsc = !this.sortAsc;
		else {
			this.sortBy = nextSort;
			this.sortAsc = true;
		}
		await settings.updateAndSave((current) => ({ ...current, sortBy: this.sortBy, sortAsc: this.sortAsc }));
	};
	setViewMode = async (mode: ViewMode) => {
		this.viewMode = mode;
		await settings.updateAndSave((current) => ({
			...current,
			viewMode: mode,
			folderViewModes: { ...current.folderViewModes, [normalizePath(this.currentPath)]: mode }
		}));
	};
	toggleHidden = async () => {
		await settings.updateAndSave((current) => ({ ...current, showHidden: !current.showHidden }));
		await this.loadDirectory(this.currentPath || get(userDirs)?.home || '/');
	};
	handleItemClick = (entry: FileEntry, event: MouseEvent) => {
		const selected = get(selection);
		if (event.ctrlKey || event.metaKey) {
			selection.toggle(entry.path);
			return;
		}
		if (event.shiftKey && selected.size > 0) {
			const selectedPaths = Array.from(selected);
			const last = this.displayEntries.findIndex((item) => item.path === selectedPaths[selectedPaths.length - 1]);
			const current = this.displayEntries.findIndex((item) => item.path === entry.path);
			if (last !== -1 && current !== -1) {
				selection.selectRange(
					this.displayEntries.slice(Math.min(last, current), Math.max(last, current) + 1).map((item) => item.path)
				);
			}
			return;
		}
		if (selected.has(entry.path)) {
			this.handleItemOpen(entry);
			return;
		}
		selection.select(entry.path);
	};
	handleItemOpen = (entry: FileEntry) => { if (entry.is_dir) this.navigate(entry.path); else api.openWithDefault(entry.path); };
	handleMiddleClick = (entry: FileEntry, event: MouseEvent) => { if (event.button === 1 && entry.is_dir) this.openNewTab(entry.path); };
	handleContextMenu = (event: MouseEvent, entry?: FileEntry) => {
		event.preventDefault();
		event.stopPropagation();
		if (entry && !get(selection).has(entry.path)) selection.select(entry.path);
		this.contextMenu = { x: event.clientX, y: event.clientY, target: entry ?? null };
	};
	handleDragStart = (event: DragEvent, entry: FileEntry) => {
		if (!get(selection).has(entry.path)) selection.select(entry.path);
		this.isDragging = true;
		this.dropCommitted = false;
		this.dragTarget = entry;
		this.dragPaths = Array.from(get(selection));
		setFileDragData(event.dataTransfer, this.dragPaths);
		if (event.dataTransfer) {
			const transparent = new Image();
			transparent.src =
				'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
			event.dataTransfer.setDragImage(transparent, 0, 0);
		}
	};
	beginInternalDrag = (entry: FileEntry) => {
		if (!get(selection).has(entry.path)) selection.select(entry.path);
		this.isDragging = true;
		this.dropCommitted = false;
		this.dragTarget = entry;
		this.dragPaths = Array.from(get(selection));
		this.setDropTarget(null);
	};
	handleDragEnd = () => {
		this.isDragging = false;
		this.dropCommitted = false;
		this.dragTarget = null;
		this.dragPaths = [];
		this.setDropTarget(null);
	};
	claimInternalDrop() {
		if (this.dropCommitted) return false;
		this.dropCommitted = true;
		return true;
	}
	canDropSelectionOnPath(targetPath: string) {
		if (!targetPath) return false;
		if (get(selection).has(targetPath)) return false;
		const sourcePaths = this.dragPaths.length > 0 ? this.dragPaths : Array.from(get(selection));
		return !sourcePaths.some((source) => targetPath === source || targetPath.startsWith(`${source}/`));
	}
	canAcceptExternalDrop(targetPath: string) {
		if (!targetPath) return false;
		return this.canDropSelectionOnPath(targetPath);
	}
	setDropTarget(target: DropTarget | null) {
		this.dropTarget = target?.path ?? null;
		this.dropTargetKey = target?.key ?? null;
	}
	updateInternalDropTarget = (target: DropTarget | null) => {
		if (!target) {
			this.setDropTarget(null);
			return;
		}
		if (target.path === 'trash' || this.canDropSelectionOnPath(target.path)) this.setDropTarget(target);
		else this.setDropTarget(null);
	};
	handleDragOver = (event: DragEvent, entry?: FileEntry, targetKey?: string) => {
		const hasDropPaths = this.isDragging || dataTransferHasPaths(event.dataTransfer);
		if (!hasDropPaths) return;
		const internalTargetSelected = this.isDragging && entry && get(selection).has(entry.path);
		if (entry && (!entry.is_dir || internalTargetSelected)) return;
		event.preventDefault();
		event.stopPropagation();
		if (entry?.is_dir) {
			this.setDropTarget({ path: entry.path, key: targetKey ?? dropTargetKeyForPath(entry.path) });
			if (event.dataTransfer) event.dataTransfer.dropEffect = this.isDragging ? (event.ctrlKey ? 'copy' : 'move') : 'copy';
			return;
		}
		this.setDropTarget({ path: this.currentPath, key: targetKey ?? dropTargetKeyForPath(this.currentPath) });
		if (event.dataTransfer) event.dataTransfer.dropEffect = this.isDragging ? (event.ctrlKey ? 'copy' : 'move') : 'copy';
	};
	handlePathDragOver = (event: DragEvent, targetPath: string, targetKey = dropTargetKeyForPath(targetPath)) => {
		if (!targetPath) return false;
		const hasDropPaths = this.isDragging || dataTransferHasPaths(event.dataTransfer);
		if (!hasDropPaths) return false;
		if (this.isDragging && !this.canDropSelectionOnPath(targetPath)) return false;
		event.preventDefault();
		event.stopPropagation();
		this.setDropTarget({ path: targetPath, key: targetKey });
		if (event.dataTransfer) event.dataTransfer.dropEffect = this.isDragging ? (event.ctrlKey ? 'copy' : 'move') : 'copy';
		return true;
	};
	handleTrashDragOver = (event: DragEvent, targetKey = trashDropKey()) => {
		const hasDropPaths = this.isDragging || dataTransferHasPaths(event.dataTransfer);
		if (!hasDropPaths) return false;
		event.preventDefault();
		event.stopPropagation();
		this.setDropTarget({ path: 'trash', key: targetKey });
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		return true;
	};
	handleDragLeave = () => { this.setDropTarget(null); };
	dropPaths = async (sourcePaths: string[], targetPath: string, move: boolean) => {
		if (sourcePaths.length === 0) return this.handleDragEnd();
		const droppingIntoSelf = sourcePaths.some((source) => targetPath === source || targetPath.startsWith(`${source}/`));
		const movingWithinCurrentFolder =
			move && targetPath === this.currentPath && sourcePaths.every((source) => getParentPath(source) === this.currentPath);
		if (droppingIntoSelf || movingWithinCurrentFolder) {
			this.handleDragEnd();
			return;
		}
		try {
			const sourceEntries = await this.fetchSourceEntries(sourcePaths);
			if (move) {
				await api.moveItems(sourcePaths, targetPath);
				if (targetPath === this.currentPath) {
					this.optimisticallyAddMovedTargets(sourcePaths, sourceEntries);
				} else {
					this.optimisticallyRemoveMovedSources(sourcePaths, targetPath);
				}
			} else {
				await api.copyItems(sourcePaths, targetPath);
				if (targetPath === this.currentPath) this.optimisticallyAddMovedTargets(sourcePaths, sourceEntries);
			}
			this.scheduleDirectoryRefresh(120, 1400);
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
		} finally {
			this.handleDragEnd();
		}
	};
	private async fetchSourceEntries(sourcePaths: string[]): Promise<Map<string, FileEntry>> {
		const byPath = new Map<string, FileEntry>();
		for (const path of sourcePaths) {
			const cached = this.entries.find((entry) => entry.path === path);
			if (cached) {
				byPath.set(path, cached);
				continue;
			}
			try {
				const entry = await api.getFileInfo(path);
				byPath.set(path, entry);
			} catch {
				const name = path.split('/').filter(Boolean).pop() ?? path;
				byPath.set(path, {
					name,
					path,
					is_dir: !name.includes('.'),
					is_file: name.includes('.'),
					is_symlink: false,
					is_hidden: name.startsWith('.'),
					size: 0,
					modified: null,
					created: null,
					accessed: null,
					mime_type: null,
					extension: name.includes('.') ? name.split('.').pop() ?? null : null,
					permissions: 0o644,
					uid: 0,
					gid: 0
				});
			}
		}
		return byPath;
	}
	optimisticallyRemoveMovedSources(sourcePaths: string[], targetPath: string) {
		if (get(currentView) !== 'home' || targetPath === this.currentPath) return;
		const sourceSet = new Set(sourcePaths);
		const nextEntries = this.entries.filter((entry) => !sourceSet.has(entry.path));
		if (nextEntries.length === this.entries.length) return;
		this.entries = nextEntries;
		selection.clear();
	}
	optimisticallyAddMovedTargets(sourcePaths: string[], sourceEntries?: Map<string, FileEntry>) {
		if (get(currentView) !== 'home') return;
		const basePath = this.currentPath.replace(/\/+$/, '');
		const knownByPath = new Map(this.entries.map((entry) => [entry.path, entry] as const));
		const additions: FileEntry[] = [];
		for (const sourcePath of sourcePaths) {
			const name = sourcePath.split('/').filter(Boolean).pop() ?? sourcePath;
			const template = sourceEntries?.get(sourcePath) ?? this.entries.find((entry) => entry.path === sourcePath);
			const destinationPath = `${basePath}/${name}`;
			if (knownByPath.has(destinationPath)) continue;
			const next: FileEntry = template
				? { ...template, path: destinationPath, name }
				: {
						name,
						path: destinationPath,
						is_dir: !name.includes('.'),
						is_file: name.includes('.'),
						is_symlink: false,
						is_hidden: name.startsWith('.'),
						size: 0,
						modified: null,
						created: null,
						accessed: null,
						mime_type: null,
						extension: name.includes('.') ? name.split('.').pop() ?? null : null,
						permissions: 0o644,
						uid: 0,
						gid: 0
					};
			knownByPath.set(next.path, next);
			additions.push(next);
		}
		if (additions.length === 0) return;
		this.entries = [...this.entries, ...additions];
		selection.clear();
	}
	scheduleDirectoryRefresh(initialDelay = 120, followupDelay = 1400) {
		const path = this.currentPath;
		if (!isDesktopRuntime() || get(currentView) !== 'home' || !path) return;
		window.setTimeout(() => {
			if (get(currentView) === 'home' && this.currentPath === path) void this.loadDirectory(path);
		}, initialDelay);
		if (followupDelay > initialDelay) {
			window.setTimeout(() => {
				if (get(currentView) === 'home' && this.currentPath === path) void this.loadDirectory(path);
			}, followupDelay);
		}
	}
	finishInternalDrop = async (targetPath: string | null, copy: boolean) => {
		if (!targetPath) return this.handleDragEnd();
		if (!this.claimInternalDrop()) return;
		if (targetPath === 'trash') {
			await this.trashSelected();
			return;
		}
		await this.dropPaths(this.dragPaths.length > 0 ? this.dragPaths : Array.from(get(selection)), targetPath, !copy);
	};
	handleDrop = async (event: DragEvent, targetPath: string) => {
		event.preventDefault();
		event.stopPropagation();
		if (!targetPath) return;
		const internalDrop = this.isDragging;
		if (internalDrop && !this.claimInternalDrop()) return;
		const sourcePaths = internalDrop ? (this.dragPaths.length > 0 ? this.dragPaths : Array.from(get(selection))) : dataTransferPaths(event.dataTransfer);
		const move = internalDrop ? !event.ctrlKey : event.shiftKey;
		await this.dropPaths(sourcePaths, targetPath, move);
	};
	handleTrashDrop = async (event: DragEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (this.isDragging && !this.claimInternalDrop()) return;
		const sourcePaths = this.isDragging ? (this.dragPaths.length > 0 ? this.dragPaths : Array.from(get(selection))) : dataTransferPaths(event.dataTransfer);
		await this.trashPaths(sourcePaths);
	};
	trashSelected = async () => {
		await this.trashPaths(this.dragPaths.length > 0 ? this.dragPaths : Array.from(get(selection)));
	};
	trashPaths = async (sourcePaths: string[]) => {
		if (sourcePaths.length === 0) return this.handleDragEnd();
		const sourceSet = new Set(sourcePaths);
		const previousEntries = this.entries;
		if (get(currentView) === 'home' && this.currentPath) {
			const next = this.entries.filter((entry) => !sourceSet.has(entry.path));
			if (next.length !== this.entries.length) this.entries = next;
		}
		try {
			await api.moveToTrash(sourcePaths);
			if (get(currentView) === 'trash') await this.loadTrash();
			else if (get(currentView) === 'home' && this.currentPath) await this.loadDirectory(this.currentPath);
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
			this.entries = previousEntries;
		} finally {
			this.handleDragEnd();
			selection.clear();
		}
	};
	copy = () => {
		const selected = this.entries.filter((entry) => get(selection).has(entry.path));
		if (selected.length > 0) copyToClipboard(selected);
	};
	cut = () => {
		const selected = this.entries.filter((entry) => get(selection).has(entry.path));
		if (selected.length > 0) cutToClipboard(selected);
	};
	paste = async () => {
		const currentClipboard = get(clipboard);
		if (!currentClipboard.items.length || !currentClipboard.operation) return;
		try {
			const paths = currentClipboard.items.map((item) => item.path);
			if (currentClipboard.operation === 'copy') {
				await api.copyItems(paths, this.currentPath);
				const sourceEntries = await this.fetchSourceEntries(paths);
				this.optimisticallyAddMovedTargets(paths, sourceEntries);
			} else {
				const sourcePaths = paths.slice();
				const sourceViewIsHome = get(currentView) === 'home';
				const sourceParent = sourcePaths.length > 0 ? getParentPath(sourcePaths[0]) : null;
				const pastingBackIntoSource =
					sourceParent === this.currentPath && sourcePaths.every((source) => getParentPath(source) === this.currentPath);
				const sourceEntries = await this.fetchSourceEntries(sourcePaths);
				await api.moveItems(paths, this.currentPath);
				if (sourceViewIsHome && !pastingBackIntoSource) this.optimisticallyRemoveMovedSources(sourcePaths, this.currentPath);
				if (this.currentPath && !pastingBackIntoSource) this.optimisticallyAddMovedTargets(sourcePaths, sourceEntries);
				clearClipboard();
			}
			this.scheduleDirectoryRefresh(120, 1400);
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
		}
	};
	deleteSelected = async () => {
		const selected = Array.from(get(selection));
		if (selected.length === 0) return;
		try {
			if (get(currentView) === 'trash') {
				await api.deletePermanently(selected);
				await this.loadTrash();
			} else {
				await api.moveToTrash(selected);
				const remaining = this.entries.filter((entry) => !selected.includes(entry.path));
				if (remaining.length !== this.entries.length) this.entries = remaining;
				selection.clear();
				this.scheduleDirectoryRefresh(180, 1600);
			}
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
		}
	};
	startCreate = (type: 'file' | 'folder') => {
		this.inlineDraft = {
			mode: 'create',
			itemType: type,
			targetPath: null,
			value: type === 'folder' ? 'New folder' : 'New file.txt',
			originalName: null
		};
		this.contextMenu = null;
		selection.clear();
	};
	startRename = (entry: FileEntry) => {
		this.inlineDraft = {
			mode: 'rename',
			itemType: entry.is_dir ? 'folder' : 'file',
			targetPath: entry.path,
			value: entry.name,
			originalName: entry.name
		};
		this.contextMenu = null;
	};
	updateDraft = (value: string) => {
		if (this.inlineDraft) this.inlineDraft = { ...this.inlineDraft, value };
	};
	cancelDraft = () => {
		this.inlineDraft = null;
	};
	isDraftUnchanged = (draft = this.inlineDraft) => {
		if (!draft) return true;
		const trimmed = draft.value.trim();
		if (!trimmed) return true;
		if (draft.mode === 'rename') return trimmed === draft.originalName;
		return trimmed === (draft.itemType === 'folder' ? 'New folder' : 'New file.txt');
	};
	commitDraft = async ({ allowUnchanged = false }: { allowUnchanged?: boolean } = {}) => {
		const draft = this.inlineDraft;
		if (!draft) return;
		const name = draft.value.trim();
		if (!name || (!allowUnchanged && this.isDraftUnchanged(draft))) {
			this.cancelDraft();
			return;
		}
		try {
			const entry =
				draft.mode === 'create'
					? draft.itemType === 'folder'
						? await api.createDirectory(this.currentPath, name)
						: await api.createFile(this.currentPath, name)
					: await api.renameItem(draft.targetPath!, name);
			this.inlineDraft = null;
			await this.loadDirectory(this.currentPath);
			selection.select(entry.path);
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
		}
	};
	toggleFavorite = async (entry: FileEntry) => {
		const currentSettings = get(settings);
		const exists = currentSettings.favorites.some((favorite) => favorite.path === entry.path);
		const favorite = { name: entry.name, path: entry.path, is_dir: entry.is_dir };
		await settings.updateAndSave((current) => ({
			...current,
			favorites: exists
				? current.favorites.filter((item) => item.path !== entry.path)
				: [favorite, ...current.favorites.filter((item) => item.path !== entry.path)]
		}));
	};
	restoreSelected = async (ids?: string[]) => {
		const selected = ids ?? Array.from(get(selection));
		if (selected.length === 0) return;
		try {
			await api.restoreFromTrash(selected);
			await this.loadTrash();
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
		}
	};
	emptyTrash = async (trashPath?: string) => {
		try {
			await api.emptyTrash(trashPath);
			await this.loadTrash();
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
		}
	};
	handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'F5') {
			event.preventDefault();
			void this.refresh();
			return;
		}
		if (event.key === 'F2' || event.code === 'F2') {
			if (this.inlineDraft) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			if (get(currentView) !== 'home') return;
			const selected = get(selection);
			if (selected.size !== 1) return;
			const selectedPath = selected.values().next().value;
			const target = this.entries.find((entry) => entry.path === selectedPath);
			if (!target) return;
			event.preventDefault();
			event.stopPropagation();
			if (event.target instanceof HTMLElement && typeof event.target.blur === 'function') {
				event.target.blur();
			}
			this.startRename(target);
			return;
		}
		if (isTextInputTarget(event.target)) return;
		if (event.ctrlKey || event.metaKey) {
			handleShortcut(event, {
				copy: this.copy,
				cut: this.cut,
				paste: this.paste,
				selectAll: () =>
					selection.selectAll(
						get(currentView) === 'trash'
							? this.trashItems.map((item) => item.id)
							: this.displayEntries.map((item) => item.path)
					),
				newTab: () => this.openNewTab(),
				closeTab: () => this.closeTab(get(activeTab)!.id),
				hasActiveTab: () => Boolean(get(activeTab))
			});
			return;
		}
		if (event.key === 'Delete') this.deleteSelected();
		if (event.key === 'Backspace') this.goUp();
		if (event.key === 'Escape') {
			selection.clear();
			this.inlineDraft = null;
			this.contextMenu = null;
		}
	};
	handleMouseButtonNavigation = (event: MouseEvent) => {
		if (event.button !== 3 && event.button !== 4) return;
		const now = performance.now();
		if (this.lastMouseNavButton === event.button && now - this.lastMouseNavAt < 120) return;
		this.lastMouseNavButton = event.button;
		this.lastMouseNavAt = now;
		event.preventDefault();
		event.stopPropagation();
		if (event.button === 3) this.goBack();
		else this.goForward();
	};
}
