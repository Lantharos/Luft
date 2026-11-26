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
		if (this.doc.quickMask) return this.#startQuick(event);
		const layer = this.doc.active;
		const onMask = this.doc.maskEditing && layer.mask !== null;
		if (layer.locked || !layer.visible || (layer.kind !== 'raster' && !onMask)) return;
		const settings = this.settings();
		this.#erasing = settings.erase || event.eraser;
		const brush = this.#erasing ? settings.eraser : settings.brush;
		this.#stroke = new StrokeMask(this.doc.width, this.doc.height, brush);
		this.doc.live = { layer, stroke: { grid: this.#stroke.grid, color: premultiplied(settings.color), opacity: brush.opacity, erase: this.#erasing, mask: onMask, clone: null } };
		this.#add(event);
	}

	move(event: ToolEvent) {
		if (this.#stroke) this.#add(event);
	}

	#startQuick(event: ToolEvent) {
		const settings = this.settings();
		this.#erasing = settings.erase || event.eraser;
		const brush = this.#erasing ? settings.eraser : settings.brush;
		this.#stroke = new StrokeMask(this.doc.width, this.doc.height, brush);
		this.doc.quickStroke = { grid: this.#stroke.grid, erase: this.#erasing, opacity: brush.opacity };
		this.#add(event);
	}

	#finishQuick(stroke: StrokeMask) {
		const quick = this.doc.quickStroke!;
		this.doc.quickStroke = null;
		const params = new Float32Array([1, 1, 1, 1, quick.opacity, 0, 0, 0]);
		new Uint32Array(params.buffer)[5] = quick.erase ? ERASE : PAINT;
		const uniform = kit.uniform(params);
		this.doc.replaceSelection(this.label(quick.erase), [...stroke.grid.tiles.keys()], (index, target, before) =>
			kit.fill(target, kit.bakeMask, [before?.createView() ?? kit.clear, stroke.grid.get(index)!.createView(), kit.full, kit.clear, uniform])
		, this.doc.bounds);
		kit.flush();
		stroke.destroy();
	}

	up() {
		if (this.doc.quickStroke && this.#stroke) {
			const stroke = this.#stroke;
			this.#stroke = null;
			return this.#finishQuick(stroke);
		}
		const stroke = this.#stroke;
		const live = this.doc.live;
		if (!stroke || !live) return;
		this.#stroke = null;
		const params = new Float32Array(8);
		params.set(live.stroke.color);
		params[4] = live.stroke.opacity;
		new Uint32Array(params.buffer)[5] = this.#erasing ? ERASE : PAINT;
		const selection = this.doc.selectionActive ? this.doc.selection : null;
		this.doc.live = null;
		const onMask = live.stroke.mask;
		if (onMask) params.set([1, 1, 1, 1]);
		const uniform = kit.uniform(params);
		const grid = onMask ? live.layer.mask! : live.layer.pixels;
		const change = this.doc.tileChange(this.label(this.#erasing), grid, [...stroke.grid.tiles.keys()], (index, target, before) => {
			kit.fill(target, onMask ? kit.bakeMask : kit.bake, [
				before?.createView() ?? (onMask ? kit.full : kit.clear),
				stroke.grid.get(index)!.createView(),
				selection ? (selection.get(index)?.createView() ?? kit.clear) : kit.full,
				kit.clear,
				uniform
			]);
		});
		live.layer.touch();
		this.doc.record(change);
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
