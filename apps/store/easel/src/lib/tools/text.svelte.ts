import { t } from '@luft/i18n';
import type { ImageDocument } from '#lib/document/image.svelte.js';
import { Batch, Toggle } from '#lib/document/entries.js';
import type { Layer, TextStyle } from '#lib/document/layers.svelte.js';
import type { ToolSettings } from '#lib/editor/settings.svelte.js';
import { renderText, textBounds } from '#lib/raster/text.js';
import type { ToolEvent, ToolHandler } from './tool';

export interface TextEdit {
	layer: Layer | null;
	style: TextStyle;
}

export class TextTool implements ToolHandler {
	readonly cursor = 'text';
	editing = $state<TextEdit | null>(null);

	constructor(
		private readonly doc: ImageDocument,
		private readonly settings: ToolSettings
	) {}

	#hit(x: number, y: number) {
		return [...this.doc.layers].reverse().find((layer) => {
			if (!layer.text || !layer.visible || layer.locked) return false;
			const bounds = textBounds(layer.text);
			return x >= bounds.x && y >= bounds.y && x <= bounds.x + bounds.width && y <= bounds.y + bounds.height;
		});
	}

	down(event: ToolEvent) {
		if (this.editing) return this.commit();
		const layer = this.#hit(event.x, event.y) ?? null;
		if (layer) {
			layer.visible = false;
			this.doc.invalidate();
			this.editing = { layer, style: { ...layer.text! } };
			return;
		}
		const { settings } = this;
		this.editing = {
			layer: null,
			style: { content: '', x: event.x, y: event.y - settings.fontSize / 2, font: settings.font, size: settings.fontSize, weight: settings.fontWeight, color: settings.primary, align: 'left' }
		};
	}

	commit() {
		const edit = this.editing;
		if (!edit) return;
		this.editing = null;
		const { doc } = this;
		if (edit.layer) edit.layer.visible = true;
		const style = { ...edit.style };
		if (!style.content.trim()) {
			if (edit.layer) doc.setLayers(t('easel-history-delete-layer'), doc.layers.filter((layer) => layer !== edit.layer));
			return doc.invalidate();
		}
		if (!edit.layer) {
			const layer = doc.newLayer('text', style.content.split('\n')[0].slice(0, 40));
			layer.text = style;
			const index = doc.layers.indexOf(doc.active) + 1;
			const added = doc.setLayers(t('easel-history-text'), [...doc.layers.slice(0, index), layer, ...doc.layers.slice(index)], layer.id, false);
			doc.record(new Batch(t('easel-history-text'), [added, renderText(doc, layer, style, t('easel-history-text'))]));
			return;
		}
		const layer = edit.layer;
		const before = layer.text!;
		layer.text = style;
		const pixels = renderText(doc, layer, style, t('easel-history-text'));
		doc.record(new Batch(t('easel-history-text'), [pixels, new Toggle('', (forward) => (layer.text = forward ? style : before))]));
	}

	cancel() {
		if (this.editing?.layer) this.editing.layer.visible = true;
		this.editing = null;
		this.doc.invalidate();
	}
}
