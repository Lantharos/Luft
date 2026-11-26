import type { ImageDocument } from '#lib/document/image.svelte.js';
import { StrokeMask, type BrushSettings } from '#lib/gpu/brush.js';
import { kit } from '#lib/gpu/kit.js';
import { premultiplied } from '#lib/raster/color.js';
import type { ToolEvent, ToolHandler } from './tool';

const PAINT = 0;
const ERASE = 1;

export class PaintTool implements ToolHandler {
	readonly cursor = 'none';
	#stroke: StrokeMask | null = null;
	#erasing = false;

	constructor(
		private readonly doc: ImageDocument,
		private readonly settings: () => { brush: BrushSettings; eraser: BrushSettings; color: string; erase: boolean },
		private readonly label: (erase: boolean) => string
	) {}

	down(event: ToolEvent) {
		const layer = this.doc.active;
		if (layer.locked || !layer.visible || layer.kind !== 'raster') return;
		const settings = this.settings();
		this.#erasing = settings.erase || event.eraser;
		const brush = this.#erasing ? settings.eraser : settings.brush;
		this.#stroke = new StrokeMask(this.doc.width, this.doc.height, brush);
		this.doc.live = { layer, stroke: { grid: this.#stroke.grid, color: premultiplied(settings.color), opacity: brush.opacity, erase: this.#erasing } };
		this.#add(event);
	}

	move(event: ToolEvent) {
		if (this.#stroke) this.#add(event);
	}

	up() {
		const stroke = this.#stroke;
		const live = this.doc.live;
		if (!stroke || !live) return;
		this.#stroke = null;
		const params = new Float32Array(8);
		params.set(live.stroke.color);
		params[4] = live.stroke.opacity;
		new Uint32Array(params.buffer)[5] = this.#erasing ? ERASE : PAINT;
		const uniform = kit.uniform(params);
		const selection = this.doc.selectionActive ? this.doc.selection : null;
		this.doc.live = null;
		this.doc.paint(this.label(this.#erasing), live.layer, [...stroke.grid.tiles.keys()], (index, target, before) => {
			kit.fill(target, kit.bake, [
				before?.createView() ?? kit.clear,
				stroke.grid.get(index)!.createView(),
				selection ? (selection.get(index)?.createView() ?? kit.clear) : kit.full,
				kit.clear,
				uniform
			]);
		});
		kit.flush();
		stroke.destroy();
	}

	cancel() {
		this.#stroke?.destroy();
		this.#stroke = null;
		this.doc.live = null;
		this.doc.invalidate();
	}

	#add(event: ToolEvent) {
		const bounds = this.#stroke!.add(event.samples);
		if (bounds) this.doc.invalidate(bounds);
	}
}
