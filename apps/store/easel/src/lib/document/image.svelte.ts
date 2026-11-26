import { Compositor, type LiveStroke } from '#lib/gpu/compositor.js';
import { kit } from '#lib/gpu/kit.js';
import type { Floating, Scene } from '#lib/gpu/presenter.js';
import type { Matrix } from '#lib/gpu/matrix.js';
import type { Adjust } from '#lib/gpu/shaders/adjust.js';
import { newTile, TileGrid, type Rect } from '#lib/gpu/tiles.js';
import { Batch, LayersChange, StateChange, Toggle } from './entries';
import { History, TileChange, type Entry } from './history.svelte';
import { applyState, Layer, layerState, type LayerKind, type LayerState } from './layers.svelte';
import { NodeBuilder } from './nodes';

export interface Guide {
	axis: 'x' | 'y';
	at: number;
}

export type Draw = (index: number, target: GPUTexture, before: GPUTexture | undefined) => void;

const CHECKER: [number[], number[]] = [
	[0.36, 0.36, 0.35, 1],
	[0.27, 0.27, 0.26, 1]
];

export class ImageDocument {
	readonly kind = 'image';
	width = $state(0);
	height = $state(0);
	layers = $state<Layer[]>([]);
	activeId = $state('');
	selectionActive = $state(false);
	selectionBounds = $state<Rect | null>(null);
	readonly history = new History();
	selection: TileGrid;
	compositor: Compositor;
	live: { layer: Layer; stroke: LiveStroke } | null = null;
	floating: Floating | null = null;
	adjust: { layer: string; value: Adjust } | null = null;
	preview: { layer: string; grid: TileGrid } | null = null;
	maskEditing = $state(false);
	quickMask = $state(false);
	guides = $state<Guide[]>([]);
	quickStroke: { grid: TileGrid; erase: boolean; opacity: number } | null = null;
	readonly nodes = new NodeBuilder();
	onchange: () => void = () => {};
	#dirty = new Set<number>();

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.selection = new TileGrid(width, height, 'r8unorm');
		this.compositor = new Compositor(width, height);
	}

	get active() {
		return this.layers.find((layer) => layer.id === this.activeId) ?? this.layers.at(-1)!;
	}

	get bounds(): Rect {
		return { x: 0, y: 0, width: this.width, height: this.height };
	}

	newLayer(kind: LayerKind, name: string, id?: string) {
		return new Layer(kind, name, this.width, this.height, id);
	}

	invalidate(area: Rect | number[] | null = null) {
		const indices = Array.isArray(area) ? area : this.compositor.levels[0].indicesIn(area ?? this.bounds);
		for (const index of indices) this.#dirty.add(index);
		this.onchange();
	}

	scene(view: Matrix): Scene {
		if (this.nodes.effectsChanged(this.layers)) for (const index of this.compositor.levels[0].all()) this.#dirty.add(index);
		if (this.#dirty.size) {
			const nodes = this.nodes.build(this.layers, { live: this.live, adjust: this.adjust, preview: this.preview });
			this.compositor.render(this.#dirty, nodes, this.selectionActive ? this.selection : null);
			this.#dirty.clear();
		}
		return {
			view,
			width: this.width,
			height: this.height,
			levels: this.compositor.levels,
			floating: this.floating,
			selection: this.selectionActive && !this.quickMask ? this.selection : null,
			checker: CHECKER,
			quickMask: this.quickMask ? { selection: this.selection, stroke: this.quickStroke?.grid ?? null, mode: this.quickStroke ? (this.quickStroke.erase ? 2 : 1) : 0, opacity: this.quickStroke?.opacity ?? 0 } : null
		};
	}

	record(entry: Entry) {
		this.history.push(entry);
	}

	undo() {
		this.history.undo();
	}

	redo() {
		this.history.redo();
	}

	tileChange(label: string, grid: TileGrid, indices: number[], draw: Draw, format: GPUTextureFormat = grid.format) {
		const changes = new Map<number, [GPUTexture | undefined, GPUTexture | undefined]>();
		for (const index of indices) {
			const before = grid.get(index);
			const target = newTile(format);
			draw(index, target, before);
			grid.set(index, target);
			changes.set(index, [before, target]);
		}
		const refresh = grid === this.selection ? () => this.invalidate() : (changed: number[]) => this.invalidate(changed);
		refresh(indices);
		return new TileChange(label, grid, changes, refresh);
	}

	paint(label: string, layer: Layer, indices: number[], draw: Draw) {
		const change = this.tileChange(label, layer.pixels, indices, draw);
		layer.touch();
		this.record(change);
		return change;
	}

	setLayers(label: string, layers: Layer[], active = this.activeId, record = true) {
		const before = this.layers;
		const previous = this.activeId;
		const apply = (next: Layer[], id: string) => {
			this.layers = next;
			this.activeId = next.some((layer) => layer.id === id) ? id : (next.at(-1)?.id ?? '');
			this.invalidate();
		};
		apply(layers, active);
		const entry = new LayersChange(label, before, layers, (next) => apply(next, next === layers ? active : previous));
		if (record) this.record(entry);
		return entry;
	}

	changeState(label: string, layer: Layer, change: Partial<LayerState>, merge = false) {
		const last = this.history.entries[this.history.position - 1];
		const before = layerState(layer);
		applyState(layer, { ...before, ...change });
		this.invalidate();
		if (merge && last instanceof StateChange && last.layer === layer && last.label === label && this.history.position === this.history.entries.length) {
			last.after = layerState(layer);
			return;
		}
		this.record(new StateChange(label, layer, before, layerState(layer), () => this.invalidate()));
	}

	replaceSelection(label: string, indices: number[], draw: Draw | null, bounds: Rect | null) {
		const wasActive = this.selectionActive;
		const wasBounds = this.selectionBounds;
		const parts: Entry[] = [];
		if (draw) parts.push(this.tileChange(label, this.selection, indices, draw, 'r8unorm'));
		const active = bounds !== null;
		const apply = (forward: boolean) => {
			this.selectionActive = forward ? active : wasActive;
			this.selectionBounds = forward ? bounds : wasBounds;
			this.invalidate();
		};
		apply(true);
		parts.push(new Toggle(label, apply));
		this.record(new Batch(label, parts));
	}

	clearSelection(label: string) {
		if (!this.selectionActive) return;
		const indices = [...this.selection.tiles.keys()];
		this.replaceSelection(label, indices, (_index, target) => kit.pass(target.createView(), [0, 0, 0, 0]).end(), null);
	}

	destroy() {
		this.history.clear();
		for (const layer of this.layers) {
			layer.pixels.destroy();
			layer.mask?.destroy();
		}
		this.nodes.destroy();
		this.selection.destroy();
		this.compositor.destroy();
	}
}
