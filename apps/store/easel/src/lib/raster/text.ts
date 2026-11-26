import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Layer, TextStyle } from '#lib/document/layers.svelte.js';
import { kit } from '#lib/gpu/kit.js';
import type { Rect } from '#lib/gpu/tiles.js';
import { clip, grow, rasterize, release } from './mask';

const LINE_HEIGHT = 1.25;
const measure = new OffscreenCanvas(1, 1).getContext('2d')!;

export const fontOf = (style: Pick<TextStyle, 'font' | 'size' | 'weight'>) => `${style.weight} ${style.size}px "${style.font}"`;

export function textLines(style: TextStyle) {
	return style.content.split('\n');
}

export function textBounds(style: TextStyle): Rect {
	measure.font = fontOf(style);
	const width = Math.max(1, ...textLines(style).map((line) => measure.measureText(line).width));
	const height = textLines(style).length * style.size * LINE_HEIGHT;
	const x = style.align === 'center' ? style.x - width / 2 : style.align === 'right' ? style.x - width : style.x;
	return { x, y: style.y, width, height };
}

export function drawText(context: OffscreenCanvasRenderingContext2D, style: TextStyle) {
	context.font = fontOf(style);
	context.fillStyle = style.color;
	context.textAlign = style.align;
	context.textBaseline = 'top';
	textLines(style).forEach((line, row) => context.fillText(line, style.x, style.y + row * style.size * LINE_HEIGHT + style.size * (LINE_HEIGHT - 1) / 2));
}

export function renderText(doc: ImageDocument, layer: Layer, style: TextStyle, label: string) {
	const area = clip(grow(textBounds(style), style.size), doc.width, doc.height);
	const shapes = area ? rasterize(layer.pixels, area, (context) => drawText(context, style)) : new Map<number, GPUTexture>();
	const indices = new Set([...layer.pixels.tiles.keys(), ...shapes.keys()]);
	const params = new Float32Array(8);
	params[4] = 1;
	new Uint32Array(params.buffer)[5] = 2;
	const uniform = kit.uniform(params);
	const change = doc.tileChange(label, layer.pixels, [...indices], (index, target) => {
		const shape = shapes.get(index);
		kit.fill(target, kit.bake, [kit.clear, kit.full, kit.full, shape?.createView() ?? kit.clear, uniform]);
	});
	release(shapes);
	layer.touch();
	return change;
}
