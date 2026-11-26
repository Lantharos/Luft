import type { ImageDocument } from '#lib/document/image.svelte.js';
import { kit } from '#lib/gpu/kit.js';
import { union, type Rect } from '#lib/gpu/tiles.js';
import { release } from '../mask';

export type SelectMode = 'new' | 'add' | 'subtract';

const PAINT = 0;
const ERASE = 1;

export function combineSelection(doc: ImageDocument, label: string, shape: Map<number, GPUTexture>, bounds: Rect, mode: SelectMode) {
	const active = doc.selectionActive;
	if (mode === 'subtract' && !active) return release(shape);
	const effective = active ? mode : 'new';
	const indices = new Set(shape.keys());
	if (effective === 'new') for (const index of doc.selection.tiles.keys()) indices.add(index);
	const params = new Float32Array([1, 1, 1, 1, 1, 0, 0, 0]);
	new Uint32Array(params.buffer)[5] = effective === 'subtract' ? ERASE : PAINT;
	const uniform = kit.uniform(params);
	doc.replaceSelection(
		label,
		[...indices],
		(index, target, before) => {
			const below = effective === 'new' ? kit.clear : (before?.createView() ?? kit.clear);
			kit.fill(target, kit.bakeMask, [below, shape.get(index)?.createView() ?? kit.clear, kit.full, kit.clear, uniform]);
		},
		effective === 'new' ? bounds : effective === 'add' ? union(doc.selectionBounds, bounds) : doc.selectionBounds
	);
	release(shape);
}
