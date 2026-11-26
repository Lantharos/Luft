import type { BrushSettings } from '#lib/gpu/brush.js';
import type { SelectMode } from '#lib/raster/selection.js';
import { readStore, writeStore } from '#lib/app/store.js';

export type ToolId = 'move' | 'select' | 'lasso' | 'wand' | 'brush' | 'eraser' | 'fill' | 'gradient' | 'text' | 'shapes' | 'picker' | 'crop';
const SAVE_DELAY = 500;

export type ShapeKind = 'rectangle' | 'ellipse' | 'line' | 'arrow';

export class ToolSettings {
	tool = $state<ToolId>('brush');
	primary = $state('#2f6fde');
	secondary = $state('#ffffff');
	brush = $state<BrushSettings>({ size: 24, hardness: 0.8, opacity: 1, smoothing: 0.3, pressureSize: true });
	eraser = $state<BrushSettings>({ size: 40, hardness: 0.9, opacity: 1, smoothing: 0.2, pressureSize: true });
	selectShape = $state<'rectangle' | 'ellipse'>('rectangle');
	selectMode = $state<SelectMode>('new');
	feather = $state(0);
	tolerance = $state(0.12);
	contiguous = $state(true);
	gradient = $state<'linear' | 'radial'>('linear');
	shape = $state<ShapeKind>('rectangle');
	shapeFilled = $state(false);
	shapeWidth = $state(6);
	font = $state('Open Runde');
	fontSize = $state(64);
	fontWeight = $state(600);

	#saving = 0;

	async load() {
		const stored = await readStore<Partial<Record<keyof ToolSettings, unknown>>>('settings');
		if (stored) Object.assign(this, stored);
		$effect.root(() => {
			$effect(() => {
				const snapshot = this.#snapshot();
				clearTimeout(this.#saving);
				this.#saving = window.setTimeout(() => void writeStore('settings', snapshot), SAVE_DELAY);
			});
		});
	}

	#snapshot() {
		return $state.snapshot({
			primary: this.primary,
			secondary: this.secondary,
			brush: this.brush,
			eraser: this.eraser,
			selectShape: this.selectShape,
			feather: this.feather,
			tolerance: this.tolerance,
			contiguous: this.contiguous,
			gradient: this.gradient,
			shape: this.shape,
			shapeFilled: this.shapeFilled,
			shapeWidth: this.shapeWidth,
			font: this.font,
			fontSize: this.fontSize,
			fontWeight: this.fontWeight
		});
	}

	swap() {
		[this.primary, this.secondary] = [this.secondary, this.primary];
	}
}
