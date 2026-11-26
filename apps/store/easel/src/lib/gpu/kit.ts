import { device } from './device';
import { ADJUST, BAKE, COMPOSITE, DOWNSAMPLE, GRADIENT, TRANSFORM } from './shaders/tile';
import { DAB } from './shaders/dab';
import { newTile, TILE } from './tiles';

const RING_BYTES = 4 << 20;
const SLOT = 256;

export type Binding = GPUTextureView | GPUSampler | GPUBufferBinding;

function pipeline(code: string, format: GPUTextureFormat, blend?: GPUBlendState, buffers: GPUVertexBufferLayout[] = []) {
	const module = device.createShaderModule({ code });
	return device.createRenderPipeline({
		layout: 'auto',
		vertex: { module, entryPoint: 'vertexMain', buffers },
		fragment: { module, entryPoint: 'fragmentMain', targets: [{ format, blend }] },
		primitive: { topology: 'triangle-strip' }
	});
}

export const PREMULTIPLIED: GPUBlendState = {
	color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
	alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }
};

const MAX: GPUBlendState = {
	color: { operation: 'max', srcFactor: 'one', dstFactor: 'one' },
	alpha: { operation: 'max', srcFactor: 'one', dstFactor: 'one' }
};

class Kit {
	composite!: GPURenderPipeline;
	adjust!: GPURenderPipeline;
	bake!: GPURenderPipeline;
	bakeMask!: GPURenderPipeline;
	gradient!: GPURenderPipeline;
	downsample!: GPURenderPipeline;
	downsampleMask!: GPURenderPipeline;
	transform!: GPURenderPipeline;
	transformMask!: GPURenderPipeline;
	dab!: GPURenderPipeline;
	linear!: GPUSampler;
	nearest!: GPUSampler;
	clear!: GPUTextureView;
	full!: GPUTextureView;
	encoder: GPUCommandEncoder | null = null;
	#ring!: GPUBuffer;
	#offset = 0;

	start() {
		this.composite = pipeline(COMPOSITE, 'rgba8unorm');
		this.adjust = pipeline(ADJUST, 'rgba8unorm');
		this.bake = pipeline(BAKE, 'rgba8unorm');
		this.bakeMask = pipeline(BAKE, 'r8unorm');
		this.gradient = pipeline(GRADIENT, 'rgba8unorm');
		this.downsample = pipeline(DOWNSAMPLE, 'rgba8unorm');
		this.downsampleMask = pipeline(DOWNSAMPLE, 'r8unorm');
		this.transform = pipeline(TRANSFORM, 'rgba8unorm', PREMULTIPLIED);
		this.transformMask = pipeline(TRANSFORM, 'r8unorm', PREMULTIPLIED);
		this.dab = pipeline(DAB, 'r8unorm', MAX, [
			{ arrayStride: 20, stepMode: 'instance', attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }, { shaderLocation: 1, offset: 16, format: 'float32' }] }
		]);
		this.linear = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
		this.nearest = device.createSampler({ magFilter: 'nearest', minFilter: 'nearest' });
		this.#ring = device.createBuffer({ size: RING_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
		const clear = newTile('rgba8unorm');
		const full = newTile('r8unorm');
		this.clear = clear.createView();
		this.full = full.createView();
		this.begin();
		this.pass(full.createView(), [1, 0, 0, 1]).end();
		this.pass(clear.createView(), [0, 0, 0, 0]).end();
		this.flush();
	}

	begin() {
		this.encoder ??= device.createCommandEncoder();
		return this.encoder;
	}

	flush() {
		if (!this.encoder) return;
		device.queue.submit([this.encoder.finish()]);
		this.encoder = null;
		this.#offset = 0;
	}

	uniform(data: ArrayBufferView<ArrayBuffer>): GPUBufferBinding {
		const size = Math.ceil(data.byteLength / 16) * 16;
		if (this.#offset + size > RING_BYTES) this.flush();
		const offset = this.#offset;
		device.queue.writeBuffer(this.#ring, offset, data.buffer, data.byteOffset, data.byteLength);
		this.#offset += Math.ceil(size / SLOT) * SLOT;
		return { buffer: this.#ring, offset, size };
	}

	group(target: GPURenderPipeline, bindings: Binding[], index = 0) {
		return device.createBindGroup({
			layout: target.getBindGroupLayout(index),
			entries: bindings.map((resource, binding) => ({ binding, resource }))
		});
	}

	pass(view: GPUTextureView, clear: GPUColor | null = null) {
		return this.begin().beginRenderPass({
			colorAttachments: [{ view, loadOp: clear ? 'clear' : 'load', clearValue: clear ?? undefined, storeOp: 'store' }]
		});
	}

	fill(target: GPUTexture, use: GPURenderPipeline, bindings: Binding[]) {
		const pass = this.pass(target.createView(), [0, 0, 0, 0]);
		pass.setPipeline(use);
		pass.setBindGroup(0, this.group(use, bindings));
		pass.draw(3);
		pass.end();
	}

	copy(source: GPUTexture, target: GPUTexture, size = TILE) {
		this.begin().copyTextureToTexture({ texture: source }, { texture: target }, [size, size]);
	}
}

export const kit = new Kit();
