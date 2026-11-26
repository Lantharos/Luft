import type { ImageDocument } from '#lib/document/image.svelte.js';
import { LEVELS } from '#lib/gpu/compositor.js';
import { NEUTRAL, type Adjust } from '#lib/gpu/shaders/adjust.js';
import { readTiles } from '#lib/raster/readback.js';

const TARGET_MIDDLE = 0.46;
const LOW = 0.01;
const HIGH = 0.99;

export async function autoAdjust(doc: ImageDocument): Promise<Adjust> {
	const kept = doc.adjust;
	doc.adjust = null;
	doc.invalidate();
	doc.scene([1, 0, 0, 1, 0, 0]);
	const grid = doc.compositor.levels[LEVELS - 1];
	const tiles = await readTiles(grid, [...grid.tiles.keys()]);
	doc.adjust = kept;
	doc.invalidate();
	const counts = new Uint32Array(256);
	let colorful = 0;
	let total = 0;
	for (const tile of tiles.values()) {
		for (let at = 0; at < tile.length; at += 4) {
			const alpha = tile[at + 3];
			if (alpha < 200) continue;
			const [r, g, b] = [tile[at], tile[at + 1], tile[at + 2]];
			counts[Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)]++;
			colorful += Math.max(r, g, b) - Math.min(r, g, b);
			total++;
		}
	}
	if (!total) return { ...NEUTRAL };
	const percentile = (share: number) => {
		let seen = 0;
		for (let level = 0; level < 256; level++) if ((seen += counts[level]) >= total * share) return level / 255;
		return 1;
	};
	const low = percentile(LOW);
	const high = percentile(HIGH);
	const middle = percentile(0.5);
	const contrast = Math.max(-0.3, Math.min(0.5, 1 / Math.max(0.2, high - low) - 1)) * 0.6;
	const exposure = Math.max(-1, Math.min(1, Math.log2(TARGET_MIDDLE / Math.max(0.02, middle)) * 0.6));
	const saturation = Math.max(0, Math.min(0.3, 0.25 - colorful / total / 255));
	return { exposure: Math.round(exposure * 100) / 100, contrast: Math.round(contrast * 100) / 100, saturation: Math.round(saturation * 100) / 100, warmth: 0, sharpen: 0.2 };
}
