import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Layer } from '#lib/document/layers.svelte.js';
import { device } from '#lib/gpu/device.js';
import { kit } from '#lib/gpu/kit.js';
import { DEVELOP } from '#lib/gpu/shaders/develop.js';
import { newTile, TILE, TileGrid } from '#lib/gpu/tiles.js';

export interface Develop {
	exposure: number;
	temperature: number;
	tint: number;
	highlights: number;
	shadows: number;
}

export const AS_SHOT: Develop = { exposure: 0, temperature: 0, tint: 0, highlights: 0, shadows: 0 };
export const LINEAR_FORMAT: GPUTextureFormat = 'rgba16float';
const PIXEL_BYTES = 8;

let developing: GPURenderPipeline | null = null;

function pipeline() {
	if (developing) return developing;
	const module = device.createShaderModule({ code: DEVELOP });
	developing = device.createRenderPipeline({
		layout: 'auto',
		vertex: { module, entryPoint: 'vertexMain' },
		fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: 'rgba8unorm' }] },
		primitive: { topology: 'triangle-strip' }
	});
	return developing;
}

export function uploadLinear(bytes: Uint8Array, width: number, height: number) {
	const grid = new TileGrid(width, height, LINEAR_FORMAT);
	for (const index of grid.all()) {
		const rect = grid.rectOf(index);
		const texture = device.createTexture({ size: [TILE, TILE], format: LINEAR_FORMAT, usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST });
		device.queue.writeTexture({ texture }, bytes, { offset: (rect.y * width + rect.x) * PIXEL_BYTES, bytesPerRow: width * PIXEL_BYTES, rowsPerImage: height }, [rect.width, rect.height]);
		grid.set(index, texture);
	}
	return grid;
}

export class RawDevelopment {
	constructor(
		readonly doc: ImageDocument,
		readonly layer: Layer,
		private readonly linear: TileGrid
	) {}

	update(values: Develop) {
		const uniform = kit.uniform(new Float32Array([values.exposure, values.temperature / 100, values.tint / 100, values.highlights / 100, values.shadows / 100, 0, 0, 0]));
		for (const [index, source] of this.linear.tiles) {
			let target = this.layer.pixels.get(index);
			if (!target) this.layer.pixels.set(index, (target = newTile()));
			kit.fill(target, pipeline(), [source.createView(), uniform]);
		}
		kit.flush();
		this.doc.invalidate([...this.linear.tiles.keys()]);
		this.layer.touch();
	}

	finish() {
		this.linear.destroy();
	}
}
