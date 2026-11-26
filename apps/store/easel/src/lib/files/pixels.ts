import { fileUrl } from '@lantharos/sabine';
import { device } from '#lib/gpu/device.js';
import { kit } from '#lib/gpu/kit.js';
import { newTile, TILE, TILE_BYTES, type TileGrid } from '#lib/gpu/tiles.js';
import { readTiles } from '#lib/raster/readback.js';

const BODY_TILES = 30;

export async function fetchBytes(path: string) {
	const response = await fetch(fileUrl(path));
	if (!response.ok) throw new Error(`${response.status} ${path}`);
	return new Uint8Array(await response.arrayBuffer());
}

export function uploadTiles(grid: TileGrid, indices: number[], data: Uint8Array) {
	kit.flush();
	indices.forEach((index, slot) => {
		const texture = newTile(grid.format);
		device.queue.writeTexture({ texture }, data, { offset: slot * TILE_BYTES, bytesPerRow: TILE * 4 }, [TILE, TILE]);
		grid.set(index, texture);
	});
}

export function uploadImage(grid: TileGrid, pixels: Uint8Array, width: number, height: number) {
	kit.flush();
	for (const index of grid.all()) {
		const rect = grid.rectOf(index);
		const texture = newTile(grid.format);
		device.queue.writeTexture({ texture }, pixels, { offset: (rect.y * width + rect.x) * 4, bytesPerRow: width * 4, rowsPerImage: height }, [rect.width, rect.height]);
		grid.set(index, texture);
	}
}

export function uploadBitmap(grid: TileGrid, bitmap: ImageBitmap, x = 0, y = 0) {
	kit.flush();
	for (const index of grid.indicesIn({ x, y, width: bitmap.width, height: bitmap.height })) {
		const rect = grid.rectOf(index);
		const left = Math.max(rect.x, x);
		const top = Math.max(rect.y, y);
		const width = Math.min(rect.x + rect.width, x + bitmap.width) - left;
		const height = Math.min(rect.y + rect.height, y + bitmap.height) - top;
		const texture = newTile(grid.format);
		device.queue.copyExternalImageToTexture({ source: bitmap, origin: [left - x, top - y] }, { texture, origin: [left - rect.x, top - rect.y], premultipliedAlpha: true }, [width, height]);
		grid.set(index, texture);
	}
}

export async function* tileBatches(grid: TileGrid) {
	const indices = [...grid.tiles.keys()];
	for (let at = 0; at < indices.length; at += BODY_TILES) {
		const batch = indices.slice(at, at + BODY_TILES);
		const tiles = await readTiles(grid, batch);
		const body = new Uint8Array(batch.length * TILE_BYTES);
		batch.forEach((index, slot) => body.set(tiles.get(index)!, slot * TILE_BYTES));
		yield { indices: batch, body };
	}
}
