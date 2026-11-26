import { device } from './device';
import { kit } from './kit';
import { newTile, TILE, TileGrid, type Rect } from './tiles';

export interface BrushSettings {
	size: number;
	hardness: number;
	opacity: number;
	smoothing: number;
	pressureSize: boolean;
}

export interface Sample {
	x: number;
	y: number;
	pressure: number;
}

const SPACING = 0.12;
const MIN_SPACING = 0.6;
const DAB_FLOATS = 5;
const MIN_PRESSURE_SHARE = 0.18;

export class StrokeMask {
	readonly grid: TileGrid;
	#last: { x: number; y: number; radius: number } | null = null;
	#smoothed: Sample | null = null;
	#buffer: GPUBuffer | null = null;

	constructor(
		width: number,
		height: number,
		private readonly settings: BrushSettings
	) {
		this.grid = new TileGrid(width, height, 'r8unorm');
	}

	#radius(pressure: number) {
		const share = this.settings.pressureSize ? MIN_PRESSURE_SHARE + (1 - MIN_PRESSURE_SHARE) * pressure : 1;
		return Math.max(0.5, (this.settings.size / 2) * share);
	}

	add(samples: Sample[]): Rect | null {
		const dabs: number[] = [];
		for (const raw of samples) {
			const follow = 1 - this.settings.smoothing * 0.88;
			const point = this.#smoothed
				? { x: this.#smoothed.x + (raw.x - this.#smoothed.x) * follow, y: this.#smoothed.y + (raw.y - this.#smoothed.y) * follow, pressure: raw.pressure }
				: raw;
			this.#smoothed = point;
			this.#walk(point, dabs);
		}
		return this.#stamp(dabs);
	}

	#walk(point: Sample, dabs: number[]) {
		const radius = this.#radius(point.pressure);
		if (!this.#last) {
			dabs.push(point.x, point.y, radius, 1, this.settings.hardness);
			this.#last = { x: point.x, y: point.y, radius };
			return;
		}
		let { x, y, radius: current } = this.#last;
		let distance = Math.hypot(point.x - x, point.y - y);
		for (;;) {
			const step = Math.max(MIN_SPACING, current * 2 * SPACING);
			if (distance < step) break;
			const share = step / distance;
			x += (point.x - x) * share;
			y += (point.y - y) * share;
			current += (radius - current) * share;
			dabs.push(x, y, current, 1, this.settings.hardness);
			distance -= step;
		}
		this.#last = { x, y, radius: current };
	}

	#stamp(dabs: number[]): Rect | null {
		if (!dabs.length) return null;
		let left = Infinity;
		let top = Infinity;
		let right = -Infinity;
		let bottom = -Infinity;
		for (let at = 0; at < dabs.length; at += DAB_FLOATS) {
			const reach = dabs[at + 2] + 1;
			left = Math.min(left, dabs[at] - reach);
			top = Math.min(top, dabs[at + 1] - reach);
			right = Math.max(right, dabs[at] + reach);
			bottom = Math.max(bottom, dabs[at + 1] + reach);
		}
		const bounds = { x: Math.floor(left), y: Math.floor(top), width: Math.ceil(right - left) + 1, height: Math.ceil(bottom - top) + 1 };
		const data = new Float32Array(dabs);
		this.#buffer?.destroy();
		const buffer = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
		device.queue.writeBuffer(buffer, 0, data);
		this.#buffer = buffer;
		const count = dabs.length / DAB_FLOATS;
		for (const index of this.grid.indicesIn(bounds)) {
			let tile = this.grid.get(index);
			const fresh = !tile;
			if (!tile) this.grid.set(index, (tile = newTile('r8unorm')));
			const rect = this.grid.rectOf(index);
			const pass = kit.pass(tile.createView(), fresh ? [0, 0, 0, 0] : null);
			pass.setPipeline(kit.dab);
			pass.setBindGroup(0, kit.group(kit.dab, [kit.uniform(new Float32Array([rect.x, rect.y, TILE, TILE]))]));
			pass.setVertexBuffer(0, buffer);
			pass.draw(4, count);
			pass.end();
		}
		kit.flush();
		return bounds;
	}

	destroy() {
		this.#buffer?.destroy();
		this.grid.destroy();
	}
}
