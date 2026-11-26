import { device } from '#lib/gpu/device.js';
import { kit } from '#lib/gpu/kit.js';
import { newTile, TILE, TileGrid, type Rect } from '#lib/gpu/tiles.js';

let canvas: OffscreenCanvas | null = null;

export type Painter = (context: OffscreenCanvasRenderingContext2D) => void;

export function rasterize(grid: TileGrid, area: Rect, paint: Painter, blur = 0) {
	canvas ??= new OffscreenCanvas(TILE, TILE);
	const context = canvas.getContext('2d')!;
	const tiles = new Map<number, GPUTexture>();
	kit.flush();
	for (const index of grid.indicesIn(area)) {
		const rect = grid.rectOf(index);
		context.reset();
		context.filter = blur > 0 ? `blur(${blur}px)` : 'none';
		context.translate(-rect.x, -rect.y);
		paint(context);
		const texture = newTile();
		device.queue.copyExternalImageToTexture({ source: canvas }, { texture, premultipliedAlpha: true }, [TILE, TILE]);
		tiles.set(index, texture);
	}
	return tiles;
}

export function grow(rect: Rect, by: number): Rect {
	return { x: rect.x - by, y: rect.y - by, width: rect.width + by * 2, height: rect.height + by * 2 };
}

export function clip(rect: Rect, width: number, height: number): Rect | null {
	const x = Math.max(0, Math.floor(rect.x));
	const y = Math.max(0, Math.floor(rect.y));
	const right = Math.min(width, Math.ceil(rect.x + rect.width));
	const bottom = Math.min(height, Math.ceil(rect.y + rect.height));
	return right > x && bottom > y ? { x, y, width: right - x, height: bottom - y } : null;
}

export function release(tiles: Map<number, GPUTexture>) {
	kit.flush();
	for (const texture of tiles.values()) texture.destroy();
}
