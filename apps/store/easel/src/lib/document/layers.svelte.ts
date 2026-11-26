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

export type LayerKind = 'raster' | 'text';

let counter = 0;
export const newId = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export class Layer {
	readonly id: string;
	readonly kind: LayerKind;
	readonly pixels: TileGrid;
	name = $state('');
	visible = $state(true);
	locked = $state(false);
	opacity = $state(1);
	blend = $state<BlendMode>('normal');
	text = $state<TextStyle | null>(null);
	version = $state(0);

	constructor(kind: LayerKind, name: string, width: number, height: number, id = newId()) {
		this.id = id;
		this.kind = kind;
		this.name = name;
		this.pixels = new TileGrid(width, height);
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
}

export const layerState = (layer: Layer): LayerState => ({
	name: layer.name,
	visible: layer.visible,
	locked: layer.locked,
	opacity: layer.opacity,
	blend: layer.blend
});

export function applyState(layer: Layer, state: LayerState) {
	Object.assign(layer, state);
}
