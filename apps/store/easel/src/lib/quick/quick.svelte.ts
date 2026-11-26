import { t } from '@luft/i18n';
import type { ImageDocument } from '#lib/document/image.svelte.js';
import { reshape } from '#lib/document/reshape.js';
import type { Overlay } from '#lib/editor/overlay.js';
import { ToolSettings } from '#lib/editor/settings.svelte.js';
import { kit } from '#lib/gpu/kit.js';
import { multiply, rotation, scaling, translation, type Matrix } from '#lib/gpu/matrix.js';
import { adjustValues, isNeutral, NEUTRAL, type Adjust } from '#lib/gpu/shaders/adjust.js';
import type { ShapeSpec } from '#lib/raster/shapes.js';
import { CropTool } from '#lib/tools/crop.svelte.js';
import { PaintTool } from '#lib/tools/paint.js';
import { ShapeTool } from '#lib/tools/shapes.js';
import { TextTool } from '#lib/tools/text.svelte.js';
import type { ToolEvent, ToolHandler } from '#lib/tools/tool.js';
import { Viewport } from '#lib/viewport/viewport.svelte.js';
import { hideArea } from './hide';

export type QuickMode = 'crop' | 'adjust' | 'markup' | 'hide' | 'size';
export type MarkupTool = 'pen' | 'arrow' | 'box' | 'text';

const HANDLE_PX = 12;
const MARKUP_COLORS = ['#e5484d', '#f2c94c', '#ffffff', '#111111', '#2f6fde'];

export class QuickEdit {
	readonly viewport = new Viewport();
	readonly settings = new ToolSettings();
	mode = $state<QuickMode>('crop');
	angle = $state(0);
	adjust = $state<Adjust>({ ...NEUTRAL });
	markupTool = $state<MarkupTool>('pen');
	hideKind = $state<'redact' | 'blur'>('blur');
	overlay = $state<Overlay | null>(null);
	shapePreview = $state<ShapeSpec | null>(null);
	readonly colors = MARKUP_COLORS;
	readonly crop: CropTool;
	readonly text: TextTool;
	readonly #photo: string;
	#markup: string | null = null;
	#paint: PaintTool;
	#shapes: ShapeTool;
	#hide: ToolHandler;

	constructor(readonly doc: ImageDocument) {
		this.#photo = doc.layers[0].id;
		this.settings.primary = MARKUP_COLORS[0];
		this.settings.brush = { size: 8, hardness: 1, opacity: 1, smoothing: 0.5, pressureSize: true };
		this.settings.shapeWidth = 8;
		this.settings.fontSize = 72;
		const show = (overlay: Overlay | null) => (this.overlay = overlay);
		this.crop = new CropTool({ doc, show, label: t('easel-history-crop'), handleRadius: () => HANDLE_PX / this.viewport.scale });
		this.text = new TextTool(doc, this.settings);
		this.#paint = new PaintTool(doc, () => ({ brush: this.settings.brush, eraser: this.settings.eraser, color: this.settings.primary, erase: false }), () => t('easel-history-markup'));
		this.#shapes = new ShapeTool({
			doc,
			label: t('easel-history-markup'),
			preview: (shape) => (this.shapePreview = shape),
			spec: (from, to) => ({ kind: this.markupTool === 'arrow' ? 'arrow' : 'rectangle', from, to, color: this.settings.primary, width: this.settings.shapeWidth, filled: false })
		});
		let start: [number, number] | null = null;
		this.#hide = {
			down: (event: ToolEvent) => (start = [event.x, event.y]),
			move: (event: ToolEvent) => {
				if (!start) return;
				this.overlay = { kind: 'marquee', shape: 'rectangle', rect: { x: Math.min(start[0], event.x), y: Math.min(start[1], event.y), width: Math.abs(event.x - start[0]), height: Math.abs(event.y - start[1]) } };
			},
			up: () => {
				const area = this.overlay?.kind === 'marquee' ? this.overlay.rect : null;
				start = null;
				this.overlay = null;
				if (area && area.width > 2 && area.height > 2) void hideArea(doc, this.photo, area, this.hideKind, t('easel-history-hide'));
			}
		};
		this.crop.start();
	}

	get photo() {
		return this.doc.layers.find((layer) => layer.id === this.#photo)!;
	}

	get handler(): ToolHandler | null {
		switch (this.mode) {
			case 'crop':
				return this.crop;
			case 'markup':
				return this.markupTool === 'pen' ? this.#paint : this.markupTool === 'text' ? this.text : this.#shapes;
			case 'hide':
				return this.#hide;
			default:
				return null;
		}
	}

	view(): Matrix {
		if (this.mode !== 'crop' || !this.angle) return this.viewport.matrix();
		return multiply(this.viewport.matrix(), this.#straighten());
	}

	#straighten(): Matrix {
		const cx = this.doc.width / 2;
		const cy = this.doc.height / 2;
		return [translation(cx, cy), rotation((this.angle * Math.PI) / 180), translation(-cx, -cy)].reduce(multiply);
	}

	choose(mode: QuickMode) {
		if (mode === this.mode) return;
		this.#leave();
		this.mode = mode;
		if (mode === 'crop') this.crop.start();
		if (mode === 'markup') this.doc.activeId = this.#markupLayer().id;
		if (mode === 'hide') this.doc.activeId = this.photo.id;
		this.doc.invalidate();
	}

	#markupLayer() {
		const existing = this.doc.layers.find((layer) => layer.id === this.#markup);
		if (existing) return existing;
		const layer = this.doc.newLayer('raster', t('easel-layer-markup'));
		this.doc.layers = [...this.doc.layers, layer];
		this.#markup = layer.id;
		return layer;
	}

	#leave() {
		this.text.commit();
		if (this.mode === 'crop') this.applyCrop();
		this.overlay = null;
	}

	straighten(angle: number) {
		this.angle = angle;
		const { width, height } = this.doc;
		const radians = Math.abs((angle * Math.PI) / 180);
		const fit = Math.min(width / (width * Math.cos(radians) + height * Math.sin(radians)), height / (width * Math.sin(radians) + height * Math.cos(radians)));
		this.crop.rect = { x: (width - width * fit) / 2, y: (height - height * fit) / 2, width: width * fit, height: height * fit };
		this.overlay = { kind: 'crop', rect: this.crop.rect };
		this.doc.onchange();
	}

	applyCrop() {
		const rect = this.crop.rect;
		const { width, height } = this.doc;
		const whole = rect && Math.round(rect.x) === 0 && Math.round(rect.y) === 0 && Math.round(rect.width) === width && Math.round(rect.height) === height;
		if (!rect || (whole && !this.angle)) return;
		const matrix = multiply(translation(-Math.round(rect.x), -Math.round(rect.y)), this.#straighten());
		reshape(this.doc, t('easel-history-crop'), Math.max(1, Math.round(rect.width)), Math.max(1, Math.round(rect.height)), matrix);
		this.angle = 0;
		this.crop.start();
		this.viewport.fit(this.doc.width, this.doc.height);
	}

	turn() {
		this.applyCrop();
		const { width, height } = this.doc;
		reshape(this.doc, t('easel-history-rotate'), height, width, [translation(height, 0), rotation(Math.PI / 2)].reduce(multiply));
		this.crop.start();
		this.viewport.fit(this.doc.width, this.doc.height);
	}

	flip() {
		this.applyCrop();
		reshape(this.doc, t('easel-history-flip'), this.doc.width, this.doc.height, multiply(translation(this.doc.width, 0), scaling(-1, 1)));
		this.crop.start();
	}

	resize(width: number, height: number) {
		reshape(this.doc, t('easel-history-resize'), width, height, scaling(width / this.doc.width, height / this.doc.height));
		this.viewport.fit(width, height);
	}

	setAdjust(adjust: Adjust) {
		this.adjust = adjust;
		this.doc.adjust = isNeutral(adjust) ? null : { layer: this.#photo, value: { ...adjust } };
		this.doc.invalidate();
	}

	bake() {
		this.#leave();
		const adjust = this.doc.adjust?.value;
		if (!adjust) return;
		const data = new Float32Array(8);
		data.set(adjustValues(adjust));
		new Uint32Array(data.buffer)[5] = 1;
		const uniform = kit.uniform(data);
		this.doc.adjust = null;
		this.adjust = { ...NEUTRAL };
		this.doc.paint(t('easel-history-adjust'), this.photo, [...this.photo.pixels.tiles.keys()], (_index, target, before) => kit.fill(target, kit.adjust, [before!.createView(), uniform]));
		kit.flush();
	}
}
