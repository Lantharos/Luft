import { device } from './device';

export const TILE = 512;
export const TILE_BYTES = TILE * TILE * 4;

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

const USAGE = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST;

export function newTile(format: GPUTextureFormat = 'rgba8unorm', size = TILE) {
	return device.createTexture({ size: [size, size], format, usage: USAGE });
}

export class TileGrid {
	readonly cols: number;
	readonly rows: number;
	readonly tiles = new Map<number, GPUTexture>();

	constructor(
		readonly width: number,
		readonly height: number,
		readonly format: GPUTextureFormat = 'rgba8unorm'
	) {
		this.cols = Math.ceil(width / TILE);
		this.rows = Math.ceil(height / TILE);
	}

	get(index: number) {
		return this.tiles.get(index);
	}

	set(index: number, texture: GPUTexture | undefined) {
		if (texture) this.tiles.set(index, texture);
		else this.tiles.delete(index);
	}

	rectOf(index: number): Rect {
		const x = (index % this.cols) * TILE;
		const y = Math.floor(index / this.cols) * TILE;
		return { x, y, width: Math.min(TILE, this.width - x), height: Math.min(TILE, this.height - y) };
	}

	indicesIn(rect: Rect) {
		const left = Math.max(0, Math.floor(rect.x / TILE));
		const top = Math.max(0, Math.floor(rect.y / TILE));
		const right = Math.min(this.cols - 1, Math.floor((rect.x + rect.width - 1) / TILE));
		const bottom = Math.min(this.rows - 1, Math.floor((rect.y + rect.height - 1) / TILE));
		const indices: number[] = [];
		for (let row = top; row <= bottom; row++) for (let col = left; col <= right; col++) indices.push(row * this.cols + col);
		return indices;
	}

	all() {
		return Array.from({ length: this.cols * this.rows }, (_, index) => index);
	}

	destroy() {
		for (const texture of this.tiles.values()) texture.destroy();
		this.tiles.clear();
	}
}

export function union(a: Rect | null, b: Rect): Rect {
	if (!a) return { ...b };
	const x = Math.min(a.x, b.x);
	const y = Math.min(a.y, b.y);
	return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
}

export function copyGrid(grid: TileGrid, copy: (source: GPUTexture, target: GPUTexture) => void) {
	const result = new TileGrid(grid.width, grid.height, grid.format);
	for (const [index, texture] of grid.tiles) {
		const tile = newTile(grid.format);
		copy(texture, tile);
		result.set(index, tile);
	}
	return result;
}
