import type { WindowFileDragEvent } from '@lantharos/sabine';
import type { FileEntry, Tab } from '$lib/types';
import { isInside } from '$lib/utils/paths';
import type { FileManager } from '../manager.svelte';
import { dataTransferHasPaths, dataTransferPaths, setFileDragData } from './data-transfer';
import { dropKey, dropTargetFromPoint, TRASH_DROP_PATH, tabDropKey, type DropTarget } from './drop-targets';

const TAB_SWITCH_DELAY_MS = 450;

export class DragController {
	#manager: FileManager;
	#pendingTab: { id: string; timer: ReturnType<typeof setTimeout> } | null = null;
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
	};

	leave = () => {
		this.target = null;
	};

	overEntry = (event: DragEvent, entry?: FileEntry, key?: string) => {
		if (!this.#carriesPaths(event)) return;
		if (entry && (!entry.is_dir || (this.dragging && this.#manager.selection.has(entry.path)))) return;
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
		if (tab.view === 'home') return this.overPath(event, tab.path, tabDropKey(tab.id));
		if (tab.view === 'trash') return this.overTrash(event, tabDropKey(tab.id));
		return false;
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

	native = (event: WindowFileDragEvent) => {
		if (event.phase === 'leave') return this.end();
		const target = dropTargetFromPoint(event.x, event.y);
		if (event.phase !== 'drop') {
			this.target = target && accepts(target, event.paths) ? target : null;
			this.#scheduleTabSwitch(target?.tabId ?? null);
			return;
		}
		const internal = event.internal || this.dragging;
		const move = event.action === 'move' || (event.action === 'none' && internal);
		if (!target || !accepts(target, event.paths) || (internal && !this.#claim())) return this.end();
		this.end();
		if (target.path === TRASH_DROP_PATH) void this.#manager.actions.trash(event.paths);
		else void this.#manager.actions.transfer(event.paths, target.path, move);
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

function accepts(target: DropTarget, sources: string[]) {
	return target.path === TRASH_DROP_PATH || canReceive(sources, target.path);
}
