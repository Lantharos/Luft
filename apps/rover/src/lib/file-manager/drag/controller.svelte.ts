import { isInside } from '@luft/ui';
import type { FileEntry, Tab } from '#lib/types/index.js';
import type { FileManager } from '../manager.svelte';
import { dataTransferHasPaths, dataTransferPaths, setFileDragData } from './data-transfer';
import { dropKey, TRASH_DROP_PATH, tabDropKey, type DropTarget } from './drop-targets';

const TAB_SWITCH_DELAY_MS = 450;
const SPRING_DELAY_MS = 700;
const SPRING_SCOPES = ['entry:', 'sidebar:', 'pathbar:'];

export class DragController {
	#manager: FileManager;
	#pendingTab: { id: string; timer: ReturnType<typeof setTimeout> } | null = null;
	#spring: { key: string; timer: ReturnType<typeof setTimeout> } | null = null;
	#committed = false;

	dragging = $state(false);
	paths = $state.raw<string[]>([]);
	anchor = $state.raw<FileEntry | null>(null);
	target = $state.raw<DropTarget | null>(null);

	constructor(manager: FileManager) {
		this.#manager = manager;
	}

	canDropOn = (targetPath: string) => canReceive(this.dragging ? this.paths : [...this.#manager.selection], targetPath);

	start = (event: DragEvent, entry: FileEntry) => {
		const manager = this.#manager;
		if (!manager.selection.has(entry.path)) manager.selectOnly(entry.path);
		this.dragging = true;
		this.#committed = false;
		this.anchor = entry;
		this.paths = [...manager.selection];
		setFileDragData(event.dataTransfer, this.paths);
	};

	end = () => {
		this.dragging = false;
		this.anchor = null;
		this.paths = [];
		this.target = null;
		this.#clearHoverTab();
		this.#relaxSpring();
	};

	settle = () => {
		if (this.dragging) this.end();
	};

	leave = () => {
		this.target = null;
	};

	overEntry = (event: DragEvent, entry?: FileEntry, key?: string) => {
		if (!this.#carriesPaths(event)) return;
		if (entry && (!entry.is_dir || (this.dragging && this.paths.includes(entry.path)))) return;
		const path = entry?.path ?? this.#manager.currentPath;
		this.#accept(event, { path, key: key ?? dropKey('path', path) }, this.#dropEffect(event));
	};

	overPath = (event: DragEvent, path: string, key = dropKey('path', path)) => {
		if (!path || !this.#carriesPaths(event) || (this.dragging && !this.canDropOn(path))) return false;
		this.#accept(event, { path, key }, this.#dropEffect(event));
		return true;
	};

	overTrash = (event: DragEvent, key: string = TRASH_DROP_PATH) => {
		if (!this.#carriesPaths(event)) return false;
		this.#accept(event, { path: TRASH_DROP_PATH, key }, 'move');
		return true;
	};

	overTab = (event: DragEvent, tab: Tab) => {
		if (tab.view === 'recent' || !this.#carriesPaths(event)) return false;
		this.#scheduleTabSwitch(tab.id);
		return tab.view === 'home' ? this.overPath(event, tab.path, tabDropKey(tab.id)) : this.overTrash(event, tabDropKey(tab.id));
	};

	leaveTab = () => {
		this.#clearHoverTab();
		this.leave();
	};

	drop = async (event: DragEvent, targetPath: string) => {
		event.preventDefault();
		event.stopPropagation();
		const internal = this.dragging;
		if (!targetPath || (internal && !this.#claim())) return;
		const sources = internal ? this.paths : dataTransferPaths(event.dataTransfer);
		const move = internal ? !event.ctrlKey : event.shiftKey;
		this.end();
		await this.#manager.actions.transfer(sources, targetPath, move);
	};

	dropOnTrash = async (event: DragEvent) => {
		event.preventDefault();
		event.stopPropagation();
		const internal = this.dragging;
		if (internal && !this.#claim()) return;
		const sources = internal ? this.paths : dataTransferPaths(event.dataTransfer);
		this.end();
		await this.#manager.actions.trash(sources);
	};

	dropOnTab = (event: DragEvent, tab: Tab) => {
		if (tab.view === 'home') void this.drop(event, tab.path);
		if (tab.view === 'trash') void this.dropOnTrash(event);
	};

	#carriesPaths(event: DragEvent) {
		return this.dragging || dataTransferHasPaths(event.dataTransfer);
	}

	#dropEffect(event: DragEvent): DataTransfer['dropEffect'] {
		if (!this.dragging) return 'copy';
		return event.ctrlKey ? 'copy' : 'move';
	}

	#accept(event: DragEvent, target: DropTarget, effect: DataTransfer['dropEffect']) {
		event.preventDefault();
		event.stopPropagation();
		this.target = target;
		if (event.dataTransfer) event.dataTransfer.dropEffect = effect;
		this.#prime(target);
	}

	#prime(target: DropTarget | null) {
		const manager = this.#manager;
		const springs = target && SPRING_SCOPES.some((scope) => target.key.startsWith(scope));
		const here = target && manager.view === 'home' && target.path === manager.currentPath;
		if (!springs || here) return this.#relaxSpring();
		const { key, path } = target;
		if (this.#spring?.key === key) return;
		this.#relaxSpring();
		this.#spring = {
			key,
			timer: setTimeout(() => {
				this.#spring = null;
				if (this.target?.key === key) void manager.navigate(path);
			}, SPRING_DELAY_MS)
		};
	}

	#relaxSpring() {
		if (this.#spring) clearTimeout(this.#spring.timer);
		this.#spring = null;
	}

	#claim() {
		if (this.#committed) return false;
		this.#committed = true;
		return true;
	}

	#scheduleTabSwitch(tabId: string | null) {
		const manager = this.#manager;
		if (!tabId || tabId === manager.tabs.activeId) return this.#clearHoverTab();
		if (this.#pendingTab?.id === tabId) return;
		this.#clearHoverTab();
		this.#pendingTab = {
			id: tabId,
			timer: setTimeout(() => {
				this.#pendingTab = null;
				if (manager.tabs.list.some((tab) => tab.id === tabId)) manager.switchTab(tabId);
			}, TAB_SWITCH_DELAY_MS)
		};
	}

	#clearHoverTab() {
		if (this.#pendingTab) clearTimeout(this.#pendingTab.timer);
		this.#pendingTab = null;
	}
}

function canReceive(sources: string[], targetPath: string) {
	return Boolean(targetPath) && !sources.some((source) => isInside(targetPath, source));
}
