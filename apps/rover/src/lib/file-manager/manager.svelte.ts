import { SvelteSet } from 'svelte/reactivity';
import * as api from '$lib/api';
import { isDesktopRuntime } from '$lib/runtime';
import { settings } from '$lib/state/settings.svelte';
import { Tabs } from '$lib/state/tabs.svelte';
import type {
	AppState,
	ClipboardState,
	DriveInfo,
	FileEntry,
	InlineDraft,
	Operation,
	SidebarView,
	SortBy,
	TabHistoryEntry,
	TrashContents,
	UserDirs,
	ViewMode
} from '$lib/types';
import { errorMessage } from '$lib/utils/format';
import { basename, parentPath, pathSegments, trimTrailingSlash } from '$lib/utils/paths';
import { FileActions } from './actions';
import { DrivesState } from './drives.svelte';
import { sortedEntries, visibleEntries } from './listing/entries';
import { DelayedLoading } from './listing/loading.svelte';
import { viewModeForPath } from './listing/view-modes';
import { previewDrives, previewEntries, previewTrash, previewUserDirs } from './preview';

export type ContextMenuState = { x: number; y: number; target: FileEntry | null };

const DUPLICATE_EVENT_MS = 120;
const NOTICE_MS = 4000;
const VIEW_TITLES: Record<SidebarView, string> = {
	home: 'Home',
	favorites: 'Favorites',
	drives: 'Drives',
	trash: 'Trash'
};
const EMPTY_TRASH: TrashContents = { items: [], locations: [] };

export class FileManager {
	readonly tabs = new Tabs();
	readonly selection = new SvelteSet<string>();
	readonly loading = new DelayedLoading();
	readonly drives = new DrivesState();
	readonly actions = new FileActions(this);

	view = $state<SidebarView>('home');
	userDirs = $state.raw<UserDirs | null>(null);
	translucent = $state(false);
	currentPath = $state('');
	entries = $state.raw<FileEntry[]>([]);
	trash = $state.raw<TrashContents>(EMPTY_TRASH);
	error = $state<string | null>(null);
	searchQuery = $state('');
	viewMode = $state<ViewMode>('list');
	draft = $state<InlineDraft | null>(null);
	contextMenu = $state<ContextMenuState | null>(null);
	clipboard = $state.raw<ClipboardState>({ items: [], operation: null });
	notice = $state<string | null>(null);
	operations = $state.raw<Operation[]>([]);

	displayEntries = $derived(
		visibleEntries(sortedEntries(this.entries, settings.value.sortBy, settings.value.sortAsc), this.searchQuery)
	);
	cuttingPaths = $derived(
		new Set(this.clipboard.operation === 'cut' ? this.clipboard.items.map((item) => item.path) : [])
	);
	pathSegments = $derived(pathSegments(this.currentPath));

	#lastContextMenu = { x: 0, y: 0, path: null as string | null, at: 0 };
	#lastNavigationButton = { button: 0, at: 0 };
	#noticeTimer: ReturnType<typeof setTimeout> | undefined;
	#finishedOperations = new Set<string>();

	notify = (caught: unknown) => {
		this.notice = errorMessage(caught);
		clearTimeout(this.#noticeTimer);
		this.#noticeTimer = setTimeout(() => (this.notice = null), NOTICE_MS);
	};

	receiveOperations = (operations: Operation[]) => {
		this.operations = operations;
		const finished = operations.filter((operation) => operation.completed_at !== null);
		const settled = finished.some((operation) => !this.#finishedOperations.has(operation.id));
		this.#finishedOperations = new Set(finished.map((operation) => operation.id));
		if (settled) void this.refreshListing(this.currentPath);
	};

	ejectDrive = (drive: DriveInfo) => this.#leavingUnmounted(() => this.drives.eject(drive));

	reloadDrives = () => this.#leavingUnmounted(this.drives.load);

	async #leavingUnmounted(change: () => Promise<void>) {
		const drive = this.view === 'home' ? this.drives.containing(this.currentPath) : undefined;
		await change().catch(this.notify);
		if (drive && !this.drives.isMounted(drive)) await this.navigate(this.homePath);
	}

	get homePath() {
		return this.userDirs?.home ?? '/';
	}

	get selectedEntries() {
		return this.entries.filter((entry) => this.selection.has(entry.path));
	}

	start = async (state: AppState, startPath?: string) => {
		settings.value = state.settings;
		this.userDirs = state.userDirs;
		this.translucent = state.translucent;
		void this.drives.load();
		const path = startPath ?? this.homePath;
		this.tabs.open(this.#homeEntry(path));
		await this.loadDirectory(path);
	};

	startPreview = () => {
		this.userDirs = previewUserDirs;
		this.drives.list = previewDrives;
		this.tabs.open(this.#homeEntry(previewUserDirs.home));
		this.#showListing(previewUserDirs.home, previewEntries(previewUserDirs.home));
	};

	loadDirectory = async (path: string) => {
		if (!isDesktopRuntime()) return this.#showListing(path, previewEntries(path));
		const token = this.loading.start();
		this.error = null;
		try {
			const listing = await api.listDirectory(path, settings.value.showHidden);
			if (!this.loading.isCurrent(token)) return;
			this.#showListing(listing.path, listing.entries);
			void api.watchDirectory(listing.path);
		} catch (caught) {
			if (!this.loading.isCurrent(token)) return;
			this.#showListing(path, []);
			this.error = errorMessage(caught);
		} finally {
			this.loading.finish(token);
		}
	};

	refreshListing = async (path: string) => {
		if (this.view !== 'home' || this.currentPath !== path || this.loading.active) return;
		const listing = await api.listDirectory(path, settings.value.showHidden).catch(() => null);
		if (!listing || this.view !== 'home' || this.currentPath !== path || this.loading.active) return;
		this.entries = listing.entries;
		const present = new Set(listing.entries.map((entry) => entry.path));
		for (const selected of this.selection) if (!present.has(selected)) this.selection.delete(selected);
	};

	loadTrash = async () => {
		if (!isDesktopRuntime()) {
			this.trash = { items: previewTrash, locations: [{ name: 'Home', path: previewTrash[0].trash_path }] };
			return;
		}
		const token = this.loading.start();
		this.error = null;
		try {
			const trash = await api.listTrash();
			if (!this.loading.isCurrent(token)) return;
			this.trash = trash;
			this.selection.clear();
		} catch (caught) {
			if (!this.loading.isCurrent(token)) return;
			this.trash = EMPTY_TRASH;
			this.error = errorMessage(caught);
		} finally {
			this.loading.finish(token);
		}
	};

	navigate = async (path: string) => {
		this.tabs.navigate(this.#homeEntry(path));
		await this.loadDirectory(path);
	};

	showView = async (view: SidebarView) => {
		if (view === 'home') return this.navigate(this.homePath);
		this.tabs.navigate({ path: this.currentPath || this.homePath, title: VIEW_TITLES[view], view });
		await this.#enterView(view);
	};

	openTab = async (path = this.currentPath || this.homePath) => {
		this.tabs.open(this.#homeEntry(path));
		await this.loadDirectory(path);
	};

	openViewInTab = async (view: SidebarView) => {
		if (view === 'home') return this.openTab(this.homePath);
		this.tabs.open({ path: this.currentPath || this.homePath, title: VIEW_TITLES[view], view });
		await this.#enterView(view);
	};

	switchTab = (id: string) => {
		this.tabs.activeId = id;
		if (this.tabs.active) void this.#restore(this.tabs.active);
	};

	closeTab = (id: string) => {
		if (this.tabs.list.length === 1) return this.actions.closeWindow();
		const wasActive = this.tabs.activeId === id;
		this.tabs.close(id);
		if (wasActive && this.tabs.active) void this.#restore(this.tabs.active);
	};

	goBack = () => {
		const entry = this.tabs.back();
		if (entry) void this.#restore(entry);
	};

	goForward = () => {
		const entry = this.tabs.forward();
		if (entry) void this.#restore(entry);
	};

	goUp = () => {
		if (this.currentPath && this.currentPath !== '/') void this.navigate(parentPath(this.currentPath));
	};

	refresh = async () => {
		if (this.view === 'home') return this.loadDirectory(this.currentPath || this.homePath);
		await this.#enterView(this.view);
	};

	setSortBy = (sortBy: SortBy) => {
		settings.update((current) => ({
			...current,
			sortBy,
			sortAsc: current.sortBy === sortBy ? !current.sortAsc : true
		}));
	};

	setViewMode = (mode: ViewMode) => {
		this.viewMode = mode;
		const path = trimTrailingSlash(this.currentPath);
		settings.update((current) => ({ ...current, folderViewModes: { ...current.folderViewModes, [path]: mode } }));
	};

	toggleHidden = async () => {
		settings.update((current) => ({ ...current, showHidden: !current.showHidden }));
		await this.loadDirectory(this.currentPath || this.homePath);
	};

	selectOnly = (path: string) => {
		this.selection.clear();
		this.selection.add(path);
	};

	replaceSelection = (paths: Iterable<string>) => {
		this.selection.clear();
		for (const path of paths) this.selection.add(path);
	};

	toggleSelected = (path: string) => {
		if (!this.selection.delete(path)) this.selection.add(path);
	};

	handleItemClick = (entry: FileEntry, event: MouseEvent) => {
		if (event.ctrlKey || event.metaKey) return this.toggleSelected(entry.path);
		const anchor = [...this.selection].at(-1);
		if (event.shiftKey && anchor) return this.#selectRange(anchor, entry.path);
		this.selectOnly(entry.path);
	};

	openEntry = (entry: Pick<FileEntry, 'path' | 'is_dir'>) => {
		if (entry.is_dir) void this.navigate(entry.path);
		else api.openWithDefault(entry.path).catch(this.notify);
	};

	openContextMenu = (event: MouseEvent, entry?: FileEntry) => {
		event.preventDefault();
		event.stopPropagation();
		const path = entry?.path ?? null;
		const previous = this.#lastContextMenu;
		const now = performance.now();
		const duplicate =
			now - previous.at < DUPLICATE_EVENT_MS &&
			Math.abs(event.clientX - previous.x) < 2 &&
			Math.abs(event.clientY - previous.y) < 2 &&
			previous.path === path;
		if (duplicate) return;
		this.#lastContextMenu = { x: event.clientX, y: event.clientY, path, at: now };
		if (entry && !this.selection.has(entry.path)) this.selectOnly(entry.path);
		this.contextMenu = { x: event.clientX, y: event.clientY, target: entry ?? null };
	};

	handleNavigationButton = (event: MouseEvent) => {
		if (event.button !== 3 && event.button !== 4) return;
		event.preventDefault();
		const now = performance.now();
		const previous = this.#lastNavigationButton;
		if (previous.button === event.button && now - previous.at < DUPLICATE_EVENT_MS) return;
		this.#lastNavigationButton = { button: event.button, at: now };
		if (event.button === 3) this.goBack();
		else this.goForward();
	};

	startCreate = (itemType: 'file' | 'folder') => {
		this.draft = { mode: 'create', itemType, targetPath: null, value: defaultName(itemType), originalName: null };
		this.contextMenu = null;
		this.selection.clear();
	};

	startRename = (entry: FileEntry) => {
		this.draft = {
			mode: 'rename',
			itemType: entry.is_dir ? 'folder' : 'file',
			targetPath: entry.path,
			value: entry.name,
			originalName: entry.name
		};
		this.contextMenu = null;
	};

	updateDraft = (value: string) => {
		if (this.draft) this.draft.value = value;
	};

	cancelDraft = () => {
		this.draft = null;
	};

	commitDraft = async () => {
		const draft = this.draft;
		const name = draft?.value.trim();
		if (!draft || !name || name === (draft.originalName ?? defaultName(draft.itemType))) return this.cancelDraft();
		try {
			const entry =
				draft.mode === 'rename'
					? await api.renameItem(draft.targetPath!, name)
					: draft.itemType === 'folder'
						? await api.createDirectory(this.currentPath, name)
						: await api.createFile(this.currentPath, name);
			this.draft = null;
			await this.refreshListing(this.currentPath);
			this.selectOnly(entry.path);
		} catch (caught) {
			this.notify(caught);
		}
	};

	#homeEntry(path: string): TabHistoryEntry {
		return { path, title: path === this.homePath ? 'Home' : basename(path) || '/', view: 'home' };
	}

	#showListing(path: string, entries: FileEntry[]) {
		this.currentPath = path;
		this.entries = entries;
		this.viewMode = viewModeForPath(path, settings.value, this.userDirs);
		this.view = 'home';
		this.searchQuery = '';
		this.draft = null;
		this.contextMenu = null;
		this.selection.clear();
	}

	async #restore(entry: TabHistoryEntry) {
		if (entry.view === 'home') return this.loadDirectory(entry.path);
		this.currentPath = entry.path;
		await this.#enterView(entry.view);
	}

	async #enterView(view: SidebarView) {
		this.view = view;
		this.searchQuery = '';
		this.draft = null;
		this.contextMenu = null;
		this.error = null;
		this.selection.clear();
		this.loading.cancel();
		if (view === 'drives') await this.drives.load();
		if (view === 'trash') await this.loadTrash();
	}

	#selectRange(fromPath: string, toPath: string) {
		const paths = this.displayEntries.map((entry) => entry.path);
		const from = paths.indexOf(fromPath);
		const to = paths.indexOf(toPath);
		if (from === -1 || to === -1) return;
		this.replaceSelection(paths.slice(Math.min(from, to), Math.max(from, to) + 1));
	}
}

export function defaultName(itemType: 'file' | 'folder') {
	return itemType === 'folder' ? 'New folder' : 'New file.txt';
}
