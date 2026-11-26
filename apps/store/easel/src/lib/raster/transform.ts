import { device } from '#lib/gpu/device.js';
import { kit } from '#lib/gpu/kit.js';
import { multiplyProjective, packedProjective, projective, scaling, type Projective } from '#lib/gpu/matrix.js';
import { TILE, type TileGrid } from '#lib/gpu/tiles.js';

const USAGE = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC;

export function assemble(grid: TileGrid) {
	const texture = device.createTexture({ size: [grid.width, grid.height], format: grid.format, usage: USAGE });
	const encoder = kit.begin();
	encoder.beginRenderPass({ colorAttachments: [{ view: texture.createView(), loadOp: 'clear', clearValue: [0, 0, 0, 0], storeOp: 'store' }] }).end();
	for (const [index, tile] of grid.tiles) {
		const rect = grid.rectOf(index);
		encoder.copyTextureToTexture({ texture: tile }, { texture, origin: [rect.x, rect.y] }, [rect.width, rect.height]);
	}
	return texture;
}

function halve(source: GPUTexture) {
	const width = Math.max(1, source.width >> 1);
	const height = Math.max(1, source.height >> 1);
	const target = device.createTexture({ size: [width, height], format: source.format, usage: USAGE });
	kit.fill(target, source.format === 'r8unorm' ? kit.downsampleMask : kit.downsample, [source.createView()]);
	return target;
}

export class Transformer {
	#levels: GPUTexture[];

	constructor(source: GPUTexture) {
		this.#levels = [source];
	}

	render(matrix: Projective, target: GPUTexture, origin: [number, number]) {
		const scale = Math.sqrt(Math.abs(matrix[0] * matrix[4] - matrix[1] * matrix[3])) / Math.abs(matrix[8]);
		let level = 0;
		while (scale * 2 ** (level + 1) <= 1 && this.#levels[level].width > 1) {
			if (!this.#levels[level + 1]) this.#levels.push(halve(this.#levels[level]));
			level++;
		}
		const source = this.#levels[level];
		const placed = multiplyProjective(matrix, projective(scaling(this.#levels[0].width / source.width, this.#levels[0].height / source.height)));
		const data = new Float32Array(20);
		packedProjective(placed, data);
		data.set([origin[0], origin[1], 0, 0, source.width, source.height, TILE, TILE], 12);
		const use = target.format === 'r8unorm' ? kit.transformMask : kit.transform;
		const pass = kit.pass(target.createView(), [0, 0, 0, 0]);
		pass.setPipeline(use);
		pass.setBindGroup(0, kit.group(use, [source.createView(), kit.linear, kit.uniform(data)]));
		pass.draw(4);
		pass.end();
	}

	destroy() {
		kit.flush();
		for (const level of this.#levels) level.destroy();
	}
}
