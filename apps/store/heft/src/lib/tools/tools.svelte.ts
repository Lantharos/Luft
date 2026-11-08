import { appState } from '#lib/app/state.js';
import type { Pen } from '#lib/ink/builder.js';
import type { EraseMode } from '#lib/ink/eraser.js';
import { newId } from '#lib/ink/stroke.js';

export type ToolId = 'draw' | 'eraser' | 'text' | 'lasso' | 'type';
export type EraserSize = 'small' | 'medium' | 'large';

export interface Preset extends Pen {
	id: string;
}

interface Stored {
	presets: Preset[];
	preset: string;
	eraserMode: EraseMode;
	eraserSize: EraserSize;
	colors: number[];
}

export const ERASER_RADIUS: Record<EraserSize, number> = { small: 4, medium: 10, large: 22 };

const DEFAULT_PRESETS: Preset[] = [
	{ id: 'black', tool: 'pen', nib: 'fountain', color: 0x1d1d1f, width: 2.4 },
	{ id: 'blue', tool: 'pen', nib: 'ballpoint', color: 0x1f4fbf, width: 1.8 },
	{ id: 'red', tool: 'pen', nib: 'ballpoint', color: 0xc8281e, width: 1.8 },
	{ id: 'yellow', tool: 'highlighter', nib: 'ballpoint', color: 0xffd23a, width: 16 }
];

export const SWATCHES = [0x1d1d1f, 0x5b5e66, 0x1f4fbf, 0x2f8bd8, 0xc8281e, 0xe0592a, 0x2e8b45, 0x7d3fb2, 0xffd23a, 0x8fe36b, 0xff8fc7, 0x7fd3ff];

const SAVE_AFTER = 400;

class Tools {
	active: ToolId = $state('draw');
	presets: Preset[] = $state(DEFAULT_PRESETS.map((preset) => ({ ...preset })));
	presetId = $state(DEFAULT_PRESETS[0].id);
	eraserMode: EraseMode = $state('stroke');
	eraserSize: EraserSize = $state('medium');
	colors: number[] = $state([]);
	private timer = 0;

	get preset(): Preset {
		return this.presets.find((preset) => preset.id === this.presetId) ?? this.presets[0];
	}

	get eraserRadius() {
		return ERASER_RADIUS[this.eraserSize];
	}

	load() {
		const tools = appState.get<Partial<Stored>>('tools');
		if (!tools) return;
		if (tools.presets?.length) this.presets = tools.presets;
		if (tools.preset) this.presetId = tools.preset;
		if (tools.eraserMode) this.eraserMode = tools.eraserMode;
		if (tools.eraserSize) this.eraserSize = tools.eraserSize;
		if (tools.colors) this.colors = tools.colors;
	}

	choose(id: string) {
		this.presetId = id;
		this.active = 'draw';
		this.changed();
	}

	update(changes: Partial<Pen>) {
		Object.assign(this.preset, changes);
		this.changed();
	}

	addPreset() {
		const preset = { ...$state.snapshot(this.preset), id: newId() };
		this.presets.push(preset);
		this.choose(preset.id);
	}

	removePreset(id: string) {
		if (this.presets.length <= 1) return;
		this.presets = this.presets.filter((preset) => preset.id !== id);
		if (this.presetId === id) this.presetId = this.presets[0].id;
		this.changed();
	}

	rememberColor(color: number) {
		if (SWATCHES.includes(color) || this.colors.includes(color)) return;
		this.colors = [color, ...this.colors].slice(0, 6);
		this.changed();
	}

	setEraser(mode: EraseMode, size: EraserSize) {
		this.eraserMode = mode;
		this.eraserSize = size;
		this.changed();
	}

	changed() {
		clearTimeout(this.timer);
		this.timer = window.setTimeout(() => void appState.save({ tools: this.snapshot() }), SAVE_AFTER);
	}

	private snapshot(): Stored {
		return {
			presets: $state.snapshot(this.presets),
			preset: this.presetId,
			eraserMode: this.eraserMode,
			eraserSize: this.eraserSize,
			colors: $state.snapshot(this.colors)
		};
	}
}

export const tools = new Tools();
