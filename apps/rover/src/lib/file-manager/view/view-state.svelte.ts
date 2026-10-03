import { isInside } from '@luft/ui';
import { tick } from 'svelte';
import { settings } from '#lib/state/settings.svelte.js';
import type { Arrival, FileEntry, ViewMemory } from '#lib/types/index.js';
import { joinPath, trimTrailingSlash } from '#lib/utils/paths.js';
import type { ChooserState } from '../chooser.svelte';
import type { FileManager } from '../manager.svelte';
import { ListMotion } from './motion.svelte';
import { TypeSelect } from './type-select';

export interface Viewport {
	columns(): number;
	pageRows(): number;
	reveal(index: number, center?: boolean): void;
	scrollTop(): number;
	scrollTo(top: number): void;
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'first' | 'last' | 'page-up' | 'page-down';

export const GRID_SIZES = [56, 72, 88, 112, 136, 168, 208];
const DEFAULT_GRID_SIZE = 88;
const STARTS_AT_END = new Set<Direction>(['up', 'left', 'page-up', 'last']);

export class ViewState {
	cursor = $state<string | null>(null);
	quickLook = $state(false);
	editingPath = $state(false);
	readonly motion = new ListMotion();
	readonly typeSelect = new TypeSelect();

	#manager: FileManager;
	#chooser: () => ChooserState | null;
	#anchor: string | null = null;
	#viewport: Viewport | null = null;

	indexByPath: Map<string, number>;
	focused: FileEntry | null;

	constructor(manager: FileManager, chooser: () => ChooserState | null) {
		this.#manager = manager;
		this.#chooser = chooser;
		this.indexByPath = $derived(new Map(manager.displayEntries.map((entry, index) => [entry.path, index])));
		this.focused = $derived(this.#entryAt(this.cursor));
		manager.captureViewWith(this.#capture);
	}

	get detailsOpen() {
		return settings.value.detailsOpen;
	}

	get gridSize() {
		return settings.value.gridSize;
	}

	attach(viewport: Viewport) {
		this.#viewport = viewport;
		return () => {
			if (this.#viewport === viewport) this.#viewport = null;
		};
	}

	toggleDetails = () => {
		settings.update((current) => ({ ...current, detailsOpen: !current.detailsOpen }));
	};

	zoom = (step: 1 | -1) => {
		const nearest = GRID_SIZES.reduce((best, size, index) =>
			Math.abs(size - this.gridSize) < Math.abs(GRID_SIZES[best] - this.gridSize) ? index : best
		, 0);
		const next = GRID_SIZES[Math.min(GRID_SIZES.length - 1, Math.max(0, nearest + step))];
		if (next !== this.gridSize) settings.update((current) => ({ ...current, gridSize: next }));
	};

	resetZoom = () => {
		settings.update((current) => ({ ...current, gridSize: DEFAULT_GRID_SIZE }));
	};

	click = (entry: FileEntry, event: MouseEvent) => {
		const chooser = this.#chooser();
		const manager = this.#manager;
		const anchor = this.#anchor ?? this.cursor;
		if (chooser) chooser.select(entry, event);
		else if (event.ctrlKey || event.metaKey) manager.toggleSelected(entry.path);
		else if (event.shiftKey && anchor) return this.#selectRange(anchor, entry.path, entry.path);
		else manager.selectOnly(entry.path);
		this.cursor = entry.path;
		this.#anchor = entry.path;
	};

	select = (paths: string[]) => {
		const chooser = this.#chooser();
		if (chooser) chooser.selectRange(paths);
		else this.#manager.replaceSelection(paths);
	};

	follow = (path: string) => {
		this.cursor = path;
		this.#anchor = path;
		const index = this.indexByPath.get(path);
		if (index !== undefined) this.#viewport?.reveal(index);
	};

	move = (direction: Direction, extend = false) => {
		const count = this.#manager.displayEntries.length;
		if (count === 0) return;
		const current = this.cursor ? (this.indexByPath.get(this.cursor) ?? -1) : -1;
		const target = current === -1 ? (STARTS_AT_END.has(direction) ? count - 1 : 0) : current + this.#offset(direction, count);
		this.focusIndex(Math.min(count - 1, Math.max(0, target)), extend);
	};

	focusIndex = (index: number, extend = false) => {
		const entry = this.#manager.displayEntries[index];
		if (!entry) return;
		const anchor = this.#anchor ?? this.cursor;
		if (extend && anchor) this.#selectRange(anchor, entry.path, entry.path);
		else {
			this.select([entry.path]);
			this.#anchor = entry.path;
		}
		this.cursor = entry.path;
		this.#viewport?.reveal(index);
	};

	toggleFocused = () => {
		if (!this.cursor || this.#chooser()) return;
		this.#manager.toggleSelected(this.cursor);
		this.#anchor = this.cursor;
	};

	typeAhead = (character: string) => {
		const entries = this.#manager.displayEntries;
		const current = this.cursor ? (this.indexByPath.get(this.cursor) ?? -1) : -1;
		const index = this.typeSelect.find(character, entries, current);
		if (index !== -1) this.focusIndex(index);
	};

	openFocused = () => {
		const manager = this.#manager;
		const chooser = this.#chooser();
		const selected = manager.selectedEntries;
		const target = this.focused ?? selected[0];
		if (!target) return;
		if (chooser) return chooser.open(target);
		if (selected.length <= 1) return manager.openEntry(target);
		for (const entry of selected) {
			if (entry.is_dir) void manager.openTab(entry.path);
			else manager.openEntry(entry);
		}
	};

	enterFocused = async () => {
		const target = this.focused;
		if (!target?.is_dir) return;
		await this.#manager.navigate(target.path);
		this.focusIndex(0);
	};

	toggleQuickLook = () => {
		if (this.quickLook) return (this.quickLook = false);
		const first = this.focused ?? this.#manager.selectedEntries[0] ?? this.#manager.displayEntries[0];
		if (!first) return;
		if (!this.#manager.selection.has(first.path)) this.focusIndex(this.indexByPath.get(first.path) ?? 0);
		this.cursor = first.path;
		this.quickLook = true;
	};

	arrive = ({ from, memory }: Arrival) => {
		this.cursor = null;
		this.#anchor = null;
		this.quickLook = false;
		if (memory) this.#recall(memory);
		else if (this.#manager.view === 'home') this.#followUp(from, this.#manager.currentPath);
	};

	#capture = (): ViewMemory | null => {
		if (!this.#viewport) return null;
		return { scroll: this.#viewport.scrollTop(), selection: [...this.#manager.selection], cursor: this.cursor };
	};

	#recall(memory: ViewMemory) {
		const selection = memory.selection.filter((path) => this.indexByPath.has(path));
		if (selection.length > 0) this.select(selection);
		if (memory.cursor && this.indexByPath.has(memory.cursor)) {
			this.cursor = memory.cursor;
			this.#anchor = memory.cursor;
		}
		void tick().then(() => this.#viewport?.scrollTo(memory.scroll));
	}

	#followUp(previous: string, current: string) {
		const base = trimTrailingSlash(current);
		if (previous === current || !isInside(previous, base)) return;
		const [child] = previous.slice(base.length).split('/').filter(Boolean);
		const path = child && joinPath(base, child);
		const index = path ? this.indexByPath.get(path) : undefined;
		if (index === undefined) return;
		this.select([path]);
		this.cursor = path;
		this.#anchor = path;
		void tick().then(() => this.#viewport?.reveal(index, true));
	}

	#offset(direction: Direction, count: number) {
		const columns = this.#manager.viewMode === 'grid' ? (this.#viewport?.columns() ?? 1) : 1;
		const page = (this.#viewport?.pageRows() ?? 10) * columns;
		const offsets: Record<Direction, number> = {
			up: -columns,
			down: columns,
			left: -1,
			right: 1,
			first: -count,
			last: count,
			'page-up': -page,
			'page-down': page
		};
		return offsets[direction];
	}

	#entryAt(path: string | null) {
		const index = path === null ? undefined : this.indexByPath.get(path);
		return index === undefined ? null : this.#manager.displayEntries[index];
	}

	#selectRange(fromPath: string, toPath: string, cursor: string) {
		const entries = this.#manager.displayEntries;
		const from = this.indexByPath.get(fromPath);
		const to = this.indexByPath.get(toPath);
		if (from === undefined || to === undefined) return;
		this.select(entries.slice(Math.min(from, to), Math.max(from, to) + 1).map((entry) => entry.path));
		this.cursor = cursor;
	}
}
