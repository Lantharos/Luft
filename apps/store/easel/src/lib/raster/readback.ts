import { device } from '#lib/gpu/device.js';
import { kit } from '#lib/gpu/kit.js';
import { TILE, type TileGrid } from '#lib/gpu/tiles.js';

const BYTES = { rgba8unorm: 4, r8unorm: 1 } as Record<GPUTextureFormat, number>;
const ROW_ALIGN = 256;

export async function readTiles(grid: TileGrid, indices: number[]) {
	const pixel = BYTES[grid.format];
	const present = indices.filter((index) => grid.get(index));
	const result = new Map<number, Uint8Array>();
	if (!present.length) return result;
	const size = grid.get(present[0])!.width;
	const row = Math.ceil((size * pixel) / ROW_ALIGN) * ROW_ALIGN;
	const stride = row * size;
	const buffer = device.createBuffer({ size: stride * present.length, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
	const encoder = kit.begin();
	present.forEach((index, slot) => {
		encoder.copyTextureToBuffer({ texture: grid.get(index)! }, { buffer, offset: slot * stride, bytesPerRow: row }, [size, size]);
	});
	kit.flush();
	await buffer.mapAsync(GPUMapMode.READ);
	const mapped = new Uint8Array(buffer.getMappedRange());
	present.forEach((index, slot) => {
		const tile = new Uint8Array(size * size * pixel);
		const base = slot * stride;
		if (row === size * pixel) tile.set(mapped.subarray(base, base + tile.length));
		else for (let y = 0; y < size; y++) tile.set(mapped.subarray(base + y * row, base + y * row + size * pixel), y * size * pixel);
		result.set(index, tile);
	});
	buffer.destroy();
	return result;
}

export async function readRegion(grid: TileGrid, area: { x: number; y: number; width: number; height: number }) {
	const pixel = BYTES[grid.format];
	const tiles = await readTiles(grid, grid.indicesIn(area));
	const out = new Uint8Array(area.width * area.height * pixel);
	for (const [index, tile] of tiles) {
		const rect = grid.rectOf(index);
		const left = Math.max(rect.x, area.x);
		const top = Math.max(rect.y, area.y);
		const right = Math.min(rect.x + rect.width, area.x + area.width);
		const bottom = Math.min(rect.y + rect.height, area.y + area.height);
		for (let y = top; y < bottom; y++) {
			const from = ((y - rect.y) * TILE + (left - rect.x)) * pixel;
			out.set(tile.subarray(from, from + (right - left) * pixel), ((y - area.y) * area.width + (left - area.x)) * pixel);
		}
	}
	return out;
}

export function writeRegion(grid: TileGrid, data: Uint8Array, area: { x: number; y: number; width: number; height: number }, target: (index: number) => GPUTexture) {
	const pixel = BYTES[grid.format];
	kit.flush();
	for (const index of grid.indicesIn(area)) {
		const rect = grid.rectOf(index);
		const left = Math.max(rect.x, area.x);
		const top = Math.max(rect.y, area.y);
		const right = Math.min(rect.x + rect.width, area.x + area.width);
		const bottom = Math.min(rect.y + rect.height, area.y + area.height);
		if (right <= left || bottom <= top) continue;
		device.queue.writeTexture(
			{ texture: target(index), origin: [left - rect.x, top - rect.y] },
			data,
			{ offset: ((top - area.y) * area.width + (left - area.x)) * pixel, bytesPerRow: area.width * pixel },
			[right - left, bottom - top]
		);
	}
}
