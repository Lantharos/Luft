import { t } from '@luft/i18n';
import type { ImageDocument } from '#lib/document/image.svelte.js';
import { blur, runInto } from '#lib/gpu/filters.js';
import { kit } from '#lib/gpu/kit.js';
import { premultiplied } from '../color';
import { floodFill } from './flood';
import { readTiles, writeRegion } from '../readback';
import { combineSelection, type SelectMode } from './selection';
import { assemble } from '../transform';
import { newTile } from '#lib/gpu/tiles.js';

export type Refinement = 'grow' | 'shrink' | 'border' | 'smooth';

const EDGES: Record<Refinement, [number, number, number, number, number]> = {
	grow: [0.01, 0.06, 0, 0, 0],
	shrink: [0.94, 0.99, 0, 0, 0],
	border: [0.01, 0.06, 0.94, 0.99, 1],
	smooth: [0.45, 0.55, 0, 0, 0]
};

export function refineSelection(doc: ImageDocument, how: Refinement, radius: number) {
	if (!doc.selectionActive) return;
	const source = assemble(doc.selection);
	const soft = blur(source, radius);
	const [low, high, innerLow, innerHigh, border] = EDGES[how];
	const bounds = doc.selectionBounds && how !== 'shrink' ? { x: doc.selectionBounds.x - radius, y: doc.selectionBounds.y - radius, width: doc.selectionBounds.width + radius * 2, height: doc.selectionBounds.height + radius * 2 } : doc.selectionBounds;
	doc.replaceSelection(
		t('easel-history-refine'),
		doc.selection.all(),
		(index, target) => {
			const rect = doc.selection.rectOf(index);
			runInto(target, 'threshold', soft, [low, high, innerLow, innerHigh, rect.x, rect.y, border], soft);
		},
		bounds
	);
	kit.flush();
	source.destroy();
	soft.destroy();
}

export async function selectColorRange(doc: ImageDocument, color: string, tolerance: number, mode: SelectMode) {
	const grid = doc.active.pixels;
	const tiles = await readTiles(grid, grid.all());
	const [r, g, b] = premultiplied(color).map((channel) => Math.round(channel * 255));
	const { mask, bounds } = await floodFill({ tiles, cols: grid.cols, width: doc.width, height: doc.height, x: 0, y: 0, tolerance, contiguous: false, color: [r, g, b, 255] });
	const shape = new Map<number, GPUTexture>();
	writeRegion(doc.selection, mask, bounds, (index) => {
		const texture = newTile('r8unorm');
		shape.set(index, texture);
		return texture;
	});
	combineSelection(doc, t('easel-history-select'), shape, bounds, mode);
}
