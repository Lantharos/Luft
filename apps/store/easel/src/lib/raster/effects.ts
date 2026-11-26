import type { Effects, Layer } from '#lib/document/layers.svelte.js';
import { blur, run } from '#lib/gpu/filters.js';
import { kit } from '#lib/gpu/kit.js';
import { newTile, TileGrid } from '#lib/gpu/tiles.js';
import { parseColor } from './color';
import { assemble } from './transform';

function split(full: GPUTexture, grid: TileGrid) {
	const encoder = kit.begin();
	for (const index of grid.all()) {
		const rect = grid.rectOf(index);
		const tile = newTile();
		encoder.copyTextureToTexture({ texture: full, origin: [rect.x, rect.y] }, { texture: tile }, [rect.width, rect.height]);
		grid.set(index, tile);
	}
}

export interface EffectGrids {
	shadow: TileGrid | null;
	stroke: TileGrid | null;
}

export function renderEffects(layer: Layer, effects: Effects): EffectGrids {
	const { width, height } = layer.pixels;
	const source = assemble(layer.pixels);
	const result: EffectGrids = { shadow: null, stroke: null };
	const garbage = [source];
	if (effects.shadow.enabled) {
		const { x, y, color, opacity } = effects.shadow;
		const soft = effects.shadow.blur > 0 ? blur(source, effects.shadow.blur) : source;
		const shadow = run('shadow', soft, [...parseColor(color).slice(0, 3), opacity, x, y, 0, 0]);
		result.shadow = new TileGrid(width, height);
		split(shadow, result.shadow);
		garbage.push(shadow);
		if (soft !== source) garbage.push(soft);
	}
	if (effects.stroke.enabled) {
		const spread = blur(source, effects.stroke.size);
		const outline = run('outline', spread, [...parseColor(effects.stroke.color).slice(0, 3), effects.stroke.opacity]);
		result.stroke = new TileGrid(width, height);
		split(outline, result.stroke);
		garbage.push(spread, outline);
	}
	kit.flush();
	for (const used of garbage) used.destroy();
	return result;
}

