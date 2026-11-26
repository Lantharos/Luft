import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Layer } from '#lib/document/layers.svelte.js';
import { kit } from '#lib/gpu/kit.js';
import type { Rect } from '#lib/gpu/tiles.js';
import { clip, rasterize, release, type Painter } from './mask';

const OVER = 2;

export function stamp(doc: ImageDocument, layer: Layer, label: string, area: Rect, paint: Painter, respectSelection = true) {
	const bounds = clip(area, doc.width, doc.height);
	if (!bounds) return;
	const shapes = rasterize(layer.pixels, bounds, paint);
	const params = new Float32Array(8);
	params[4] = 1;
	new Uint32Array(params.buffer)[5] = OVER;
	const uniform = kit.uniform(params);
	const selection = respectSelection && doc.selectionActive ? doc.selection : null;
	doc.paint(label, layer, [...shapes.keys()], (index, target, before) => {
		kit.fill(target, kit.bake, [
			before?.createView() ?? kit.clear,
			kit.full,
			selection ? (selection.get(index)?.createView() ?? kit.clear) : kit.full,
			shapes.get(index)!.createView(),
			uniform
		]);
	});
	release(shapes);
}
