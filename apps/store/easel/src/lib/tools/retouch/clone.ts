import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Overlay } from '#lib/editor/stage/overlay.js';
import { StrokeMask, type BrushSettings } from '#lib/gpu/brush.js';
import { blendTile } from '#lib/gpu/compositor.js';
import { blur } from '#lib/gpu/filters.js';
import { kit } from '#lib/gpu/kit.js';
import { assemble } from '#lib/raster/transform.js';
import type { ToolEvent, ToolHandler } from '../tool';

export interface CloneHost {
	doc: ImageDocument;
	brush(): BrushSettings;
	heal: boolean;
	label: string;
	show(overlay: Overlay | null): void;
}

export class CloneTool implements ToolHandler {
	readonly cursor = 'crosshair';
	#source: [number, number] | null = null;
	#offset: [number, number] | null = null;
	#stroke: StrokeMask | null = null;
	#textures: GPUTexture[] = [];

	constructor(private readonly host: CloneHost) {}

	down(event: ToolEvent) {
		const { doc } = this.host;
		const layer = doc.active;
		if (event.alt) {
			this.#source = [event.x, event.y];
			this.#offset = null;
			this.host.show({ kind: 'point', x: event.x, y: event.y });
			return;
		}
		if (!this.#source || !layer.paintable) return;
		this.#offset ??= [event.x - this.#source[0], event.y - this.#source[1]];
		const brush = this.host.brush();
		const source = assemble(layer.pixels);
		const low = this.host.heal ? blur(source, Math.max(4, brush.size / 2)) : null;
		this.#textures = low ? [source, low] : [source];
		this.#stroke = new StrokeMask(doc.width, doc.height, brush);
		doc.live = { layer, stroke: { grid: this.#stroke.grid, color: [0, 0, 0, 0], opacity: brush.opacity, erase: false, mask: false, clone: { source, low, offset: this.#offset } } };
		this.move(event);
	}

	move(event: ToolEvent) {
		if (!this.#stroke) return;
		const bounds = this.#stroke.add(event.samples);
		if (this.#offset) this.host.show({ kind: 'point', x: event.x - this.#offset[0], y: event.y - this.#offset[1] });
		if (bounds) this.host.doc.invalidate(bounds);
	}

	up() {
		const stroke = this.#stroke;
		const { doc } = this.host;
		const live = doc.live;
		if (!stroke || !live) return;
		this.#stroke = null;
		doc.live = null;
		const selection = doc.selectionActive ? doc.selection : null;
		doc.paint(this.host.label, live.layer, [...stroke.grid.tiles.keys()], (index, target, before) =>
			blendTile(target, kit.clear, before?.createView() ?? kit.clear, kit.full, 1, 'normal', live.stroke, null, selection, index)
		);
		kit.flush();
		stroke.destroy();
		for (const texture of this.#textures) texture.destroy();
		this.#textures = [];
	}

	cancel() {
		this.#stroke?.destroy();
		this.#stroke = null;
		this.host.doc.live = null;
		this.host.show(null);
		for (const texture of this.#textures) texture.destroy();
		this.#textures = [];
	}
}
