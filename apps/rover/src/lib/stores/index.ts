import { writable, derived, get } from 'svelte/store';
import type {
	Tab,
	TabHistoryEntry,
	FileEntry,
	Settings,
	ClipboardState,
	UserDirs,
	DriveInfo,
	SidebarView
} from '../types';
import { generateId } from '../utils';
import * as api from '../api';
import { previewDrives, previewUserDirs } from '$lib/file-manager/preview';
import { isDesktopRuntime } from '$lib/runtime';

// Settings store
function createSettingsStore() {
	const { subscribe, set, update } = writable<Settings>({
		viewMode: 'list',
		folderViewModes: {},
		sortBy: 'name',
		sortAsc: true,
		showHidden: false,
		previewPanel: false,
		confirmDelete: true,
		confirmTrash: false,
		singleClickOpen: false,
		sidebarWidth: 270,
		iconSize: 48,
		favorites: [],
		pinnedFolders: [],
		sidebarBookmarksInitialized: false,
		recentPaths: []
	});

	return {
		subscribe,
		set,
		update,
		async load() {
			if (!isDesktopRuntime()) return;
			try {
				const settings = await api.getSettings();
				set(settings);
			} catch (e) {
				console.error('Failed to load settings:', e);
			}
		},
		async save(settings: Settings) {
			set(settings);
			if (!isDesktopRuntime()) return;
			try {
				await api.updateSettings(settings);
			} catch (e) {
				console.error('Failed to save settings:', e);
			}
		},
		async updateAndSave(updater: (settings: Settings) => Settings) {
			const next = updater(get({ subscribe }));
			set(next);
			if (!isDesktopRuntime()) return;
			try {
				await api.updateSettings(next);
			} catch (e) {
				console.error('Failed to save settings:', e);
			}
		}
	};
}

export const settings = createSettingsStore();

// User directories store
export const userDirs = writable<UserDirs | null>(null);

export async function loadUserDirs() {
	if (!isDesktopRuntime()) {
		userDirs.set(previewUserDirs);
		return previewUserDirs;
	}
	try {
		const dirs = await api.getUserDirs();
		userDirs.set(dirs);
		return dirs;
	} catch (e) {
		console.error('Failed to load user dirs:', e);
		return null;
	}
}

// Tabs store
function createTabsStore() {
	const { subscribe, set, update } = writable<Tab[]>([]);
	const activeTabId = writable<string | null>(null);

	function tabEntry(path: string, title: string, view: SidebarView): TabHistoryEntry {
		return { path, title, view };
	}

	function sameEntry(tab: Tab, entry: TabHistoryEntry) {
		return tab.path === entry.path && tab.view === entry.view;
	}

	function navigateEntry(id: string, entry: TabHistoryEntry) {
		update(tabs =>
			tabs.map(t => {
				if (t.id !== id) return t;

				if (!sameEntry(t, entry)) {
					const newHistory = t.history.slice(0, t.historyIndex + 1);
					newHistory.push(entry);
					return {
						...t,
						...entry,
						history: newHistory,
						historyIndex: newHistory.length - 1
					};
				}
				return t;
			})
		);
	}

	return {
		subscribe,
		activeTabId,
		
		async init(homePath: string) {
			const id = generateId();
			const tab: Tab = {
				id,
				path: homePath,
				title: 'Home',
				view: 'home',
				history: [tabEntry(homePath, 'Home', 'home')],
				historyIndex: 0
			};
			set([tab]);
			activeTabId.set(id);
			return tab;
		},
		
		addTab(path: string, title: string, view: SidebarView = 'home') {
			const id = generateId();
			const tab: Tab = {
				id,
				path,
				title,
				view,
				history: [tabEntry(path, title, view)],
				historyIndex: 0
			};
			update(tabs => [...tabs, tab]);
			activeTabId.set(id);
			return tab;
		},
		
		closeTab(id: string) {
			update(tabs => {
				const index = tabs.findIndex(t => t.id === id);
				if (index === -1) return tabs;
				
				const newTabs = tabs.filter(t => t.id !== id);
				
				if (newTabs.length === 0) {
					// Don't close the last tab
					return tabs;
				}
				
				// If closing active tab, switch to adjacent tab
				if (get(activeTabId) === id) {
					const newIndex = Math.min(index, newTabs.length - 1);
					activeTabId.set(newTabs[newIndex].id);
				}
				
				return newTabs;
			});
		},
		
		setActiveTab(id: string) {
			activeTabId.set(id);
		},
		
		updateTab(id: string, updates: Partial<Tab>) {
			update(tabs => 
				tabs.map(t => t.id === id ? { ...t, ...updates } : t)
			);
		},
		
		navigateEntry,

		navigate(id: string, path: string, title: string) {
			navigateEntry(id, tabEntry(path, title, 'home'));
		},

		navigateView(id: string, view: SidebarView, path: string, title: string) {
			navigateEntry(id, tabEntry(path, title, view));
		},
		
		goBack(id: string) {
			let entry: TabHistoryEntry | null = null;
			update(tabs => 
				tabs.map(t => {
					if (t.id !== id || t.historyIndex <= 0) return t;
					const newIndex = t.historyIndex - 1;
					entry = t.history[newIndex];
					return {
						...t,
						...entry!,
						historyIndex: newIndex
					};
				})
			);
			return entry;
		},
		
		goForward(id: string) {
			let entry: TabHistoryEntry | null = null;
			update(tabs => 
				tabs.map(t => {
					if (t.id !== id || t.historyIndex >= t.history.length - 1) return t;
					const newIndex = t.historyIndex + 1;
					entry = t.history[newIndex];
					return {
						...t,
						...entry!,
						historyIndex: newIndex
					};
				})
			);
			return entry;
		},
		
		canGoBack(tab: Tab): boolean {
			return tab.historyIndex > 0;
		},
		
		canGoForward(tab: Tab): boolean {
			return tab.historyIndex < tab.history.length - 1;
		}
	};
}

export const tabs = createTabsStore();

// Get active tab derived store
export const activeTab = derived(
	[tabs, tabs.activeTabId],
	([$tabs, $activeTabId]) => $tabs.find(t => t.id === $activeTabId) ?? null
);

// Selection store
function createSelectionStore() {
	const { subscribe, set, update } = writable<Set<string>>(new Set());

	return {
		subscribe,
		
		select(path: string, addToSelection = false) {
			update(selection => {
				if (addToSelection) {
					const newSelection = new Set(selection);
					if (newSelection.has(path)) {
						newSelection.delete(path);
					} else {
						newSelection.add(path);
					}
					return newSelection;
				}
				return new Set([path]);
			});
		},
		
		selectRange(paths: string[]) {
			set(new Set(paths));
		},
		
		selectAll(paths: string[]) {
			set(new Set(paths));
		},
		
		clear() {
			set(new Set());
		},
		
		toggle(path: string) {
			update(selection => {
				const newSelection = new Set(selection);
				if (newSelection.has(path)) {
					newSelection.delete(path);
				} else {
					newSelection.add(path);
				}
				return newSelection;
			});
		},
		
		isSelected(path: string): boolean {
			return get({ subscribe }).has(path);
		}
	};
}

export const selection = createSelectionStore();

// Clipboard store
export const clipboard = writable<ClipboardState>({
	items: [],
	operation: null
});

export function copyToClipboard(items: FileEntry[]) {
	clipboard.set({ items, operation: 'copy' });
}

export function cutToClipboard(items: FileEntry[]) {
	clipboard.set({ items, operation: 'cut' });
}

export function clearClipboard() {
	clipboard.set({ items: [], operation: null });
}

// Current view state
export const currentView = writable<SidebarView>('home');

// Drives store
export const drives = writable<DriveInfo[]>([]);

export async function loadDrives() {
	if (!isDesktopRuntime()) {
		drives.set(previewDrives);
		return previewDrives;
	}
	try {
		const result = await api.listDrives();
		drives.set(result.drives);
		return result.drives;
	} catch (e) {
		console.error('Failed to load drives:', e);
		return [];
	}
}

// Search state
export const searchQuery = writable<string>('');
export const searchResults = writable<FileEntry[]>([]);
export const isSearching = writable<boolean>(false);

// Context menu state
export const contextMenu = writable<{
	show: boolean;
	x: number;
	y: number;
	items: FileEntry[];
} | null>(null);

// Modal state
export const modal = writable<{
	type: 'newFile' | 'newFolder' | 'rename' | 'delete' | 'properties' | null;
	data?: any;
}>({ type: null });

// Loading state
export const isLoading = writable<boolean>(false);

// Error state
export const error = writable<string | null>(null);
