import { t } from '@luft/i18n';
import type { ImageDocument } from '#lib/document/image.svelte.js';
import { Viewport } from '#lib/viewport/viewport.svelte.js';
import type { ShapeSpec } from '#lib/raster/shapes.js';
import { FillTool, WandTool } from '#lib/tools/flood.js';
import { GradientTool } from '#lib/tools/gradient.js';
import { MoveTool } from '#lib/tools/move.svelte.js';
import { PaintTool } from '#lib/tools/paint.js';
import { PickerTool } from '#lib/tools/picker.js';
import { LassoTool, MarqueeTool, modeFor } from '#lib/tools/select.js';
import { ShapeTool } from '#lib/tools/shapes.js';
import type { ToolEvent, ToolHandler } from '#lib/tools/tool.js';
import { CropTool } from '#lib/tools/crop.svelte.js';
import { TextTool } from '#lib/tools/text.svelte.js';
import type { Overlay } from './overlay';
import type { ToolId, ToolSettings } from './settings.svelte';

const HANDLE_PX = 9;

export class Editor {
	readonly viewport = new Viewport();
	overlay = $state<Overlay | null>(null);
	shapePreview = $state<ShapeSpec | null>(null);
	busy = $state(false);
	readonly handlers: Record<ToolId, ToolHandler>;
	readonly move: MoveTool;
	readonly crop: CropTool;
	readonly text: TextTool;

	constructor(
		readonly doc: ImageDocument,
		readonly settings: ToolSettings
	) {
		settings.fontSize = Math.max(12, Math.min(400, Math.round(Math.min(doc.width, doc.height) / 14)));
		const show = (overlay: Overlay | null) => (this.overlay = overlay);
		const selectHost = (label: string) => ({ doc, label, show, feather: () => settings.feather, mode: (event: ToolEvent) => modeFor(event, settings.selectMode) });
		const floodHost = (label: string, color: () => string) => ({
			doc,
			label,
			color,
			tolerance: () => settings.tolerance,
			contiguous: () => settings.contiguous,
			mode: (event: ToolEvent) => modeFor(event, settings.selectMode),
			busy: (running: boolean) => (this.busy = running)
		});
		const paint = new PaintTool(
			doc,
			() => ({ brush: settings.brush, eraser: settings.eraser, color: settings.primary, erase: settings.tool === 'eraser' }),
			(erase) => t(erase ? 'easel-history-erase' : 'easel-history-brush')
		);
		this.move = new MoveTool({ doc, show, label: t('easel-history-move'), handleRadius: () => HANDLE_PX / this.viewport.scale });
		this.crop = new CropTool({ doc, show, label: t('easel-history-crop'), handleRadius: () => HANDLE_PX / this.viewport.scale });
		this.text = new TextTool(doc, settings);
		this.handlers = {
			move: this.move,
			select: new MarqueeTool(selectHost(t('easel-history-select')), () => settings.selectShape),
			lasso: new LassoTool(selectHost(t('easel-history-select'))),
			wand: new WandTool(floodHost(t('easel-history-select'), () => settings.primary)),
			brush: paint,
			eraser: paint,
			fill: new FillTool(floodHost(t('easel-history-fill'), () => settings.primary)),
			gradient: new GradientTool({ doc, show, label: t('easel-history-gradient'), colors: () => [settings.primary, settings.secondary], radial: () => settings.gradient === 'radial' }),
			text: this.text,
			shapes: new ShapeTool({
				doc,
				label: t('easel-history-shape'),
				preview: (shape) => (this.shapePreview = shape),
				spec: (from, to) => ({ kind: settings.shape, from, to, color: settings.primary, width: settings.shapeWidth, filled: settings.shapeFilled })
			}),
			picker: new PickerTool(doc, (color, secondary) => {
				if (secondary) settings.secondary = color;
				else settings.primary = color;
			}),
			crop: this.crop
		};
	}

	get handler() {
		return this.handlers[this.settings.tool];
	}

	choose(tool: ToolId) {
		if (tool === this.settings.tool) return;
		this.finishTool();
		this.settings.tool = tool;
		if (tool === 'crop') this.crop.start();
	}

	finishTool() {
		this.handler.commit?.();
		this.overlay = null;
	}

	undo() {
		this.handler.cancel?.();
		this.doc.undo();
	}

	redo() {
		this.handler.cancel?.();
		this.doc.redo();
	}
}
