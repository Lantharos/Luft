import type { Adjustment } from '#lib/adjust/adjustments.js';
import type { BlendMode } from '#lib/gpu/shaders/blend.js';
import { TileGrid } from '#lib/gpu/tiles.js';

export interface TextStyle {
	content: string;
	x: number;
	y: number;
	font: string;
	size: number;
	weight: number;
	color: string;
	align: 'left' | 'center' | 'right';
}

export interface Effects {
	shadow: { enabled: boolean; x: number; y: number; blur: number; color: string; opacity: number };
	stroke: { enabled: boolean; size: number; color: string; opacity: number };
}

export const NO_EFFECTS: Effects = {
	shadow: { enabled: false, x: 8, y: 12, blur: 16, color: '#000000', opacity: 0.45 },
	stroke: { enabled: false, size: 6, color: '#ffffff', opacity: 1 }
};

export type LayerKind = 'raster' | 'text' | 'adjustment' | 'group';

let counter = 0;
export const newId = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export class Layer {
	readonly id: string;
	readonly kind: LayerKind;
	readonly pixels: TileGrid;
	mask = $state.raw<TileGrid | null>(null);
	name = $state('');
	visible = $state(true);
	locked = $state(false);
	opacity = $state(1);
	blend = $state<BlendMode>('normal');
	text = $state<TextStyle | null>(null);
	adjustment = $state<Adjustment | null>(null);
	effects = $state<Effects | null>(null);
	maskEnabled = $state(true);
	parent = $state<string | null>(null);
	collapsed = $state(false);
	version = $state(0);

	constructor(kind: LayerKind, name: string, width: number, height: number, id = newId()) {
		this.id = id;
		this.kind = kind;
		this.name = name;
		this.pixels = new TileGrid(width, height);
	}

	get paintable() {
		return this.kind === 'raster' && !this.locked;
	}

	touch() {
		this.version++;
	}
}

export interface LayerState {
	name: string;
	visible: boolean;
	locked: boolean;
	opacity: number;
	blend: BlendMode;
	adjustment: Adjustment | null;
	effects: Effects | null;
	maskEnabled: boolean;
	parent: string | null;
	collapsed: boolean;
}

export const layerState = (layer: Layer): LayerState => ({
	name: layer.name,
	visible: layer.visible,
	locked: layer.locked,
	opacity: layer.opacity,
	blend: layer.blend,
	adjustment: layer.adjustment && $state.snapshot(layer.adjustment),
	effects: layer.effects && $state.snapshot(layer.effects),
	maskEnabled: layer.maskEnabled,
	parent: layer.parent,
	collapsed: layer.collapsed
});

export function applyState(layer: Layer, state: LayerState) {
	Object.assign(layer, { ...state, adjustment: state.adjustment && structuredClone(state.adjustment), effects: state.effects && structuredClone(state.effects) });
}
