import { device } from './device';
import { kit } from './kit';
import { BLUR, DENOISE, MIX, MOTION, OUTLINE, PIXELATE, RESAMPLE, SHADOW, THRESHOLD, UNSHARP, VIGNETTE } from './shaders/filters';

const USAGE = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST;
const DIRECT_RADIUS = 8;
const MOST_HALVINGS = 4;

const CODE = { blur: BLUR, motion: MOTION, resample: RESAMPLE, unsharp: UNSHARP, denoise: DENOISE, vignette: VIGNETTE, pixelate: PIXELATE, shadow: SHADOW, outline: OUTLINE, mix: MIX, threshold: THRESHOLD };
type Program = keyof typeof CODE;

const pipelines = new Map<string, GPURenderPipeline>();

function pipeline(program: Program, format: GPUTextureFormat = 'rgba8unorm') {
	const key = `${program}|${format}`;
	let found = pipelines.get(key);
	if (!found) {
		const module = device.createShaderModule({ code: CODE[program] });
		found = device.createRenderPipeline({
			layout: 'auto',
			vertex: { module, entryPoint: 'vertexMain' },
			fragment: { module, entryPoint: 'fragmentMain', targets: [{ format }] },
			primitive: { topology: 'triangle-strip' }
		});
		pipelines.set(key, found);
	}
	return found;
}

export function texture(width: number, height: number) {
	return device.createTexture({ size: [Math.max(1, width), Math.max(1, height)], format: 'rgba8unorm', usage: USAGE });
}

export function run(program: Program, source: GPUTexture, values: number[], width = source.width, height = source.height, other: GPUTexture = source, extra: GPUTextureView[] = []) {
	const target = texture(width, height);
	const data = new Float32Array(12);
	data.set(values);
	kit.fill(target, pipeline(program), [source.createView(), kit.linear, kit.uniform(data), other.createView(), ...extra]);
	return target;
}

export function runInto(target: GPUTexture, program: Program, source: GPUTexture, values: number[], other: GPUTexture, extra: GPUTextureView[] = []) {
	const data = new Float32Array(12);
	data.set(values);
	kit.fill(target, pipeline(program, target.format), [source.createView(), kit.linear, kit.uniform(data), other.createView(), ...extra]);
}

export function blur(source: GPUTexture, radius: number) {
	const garbage: GPUTexture[] = [];
	let current = source;
	let scale = 1;
	while (radius / scale > DIRECT_RADIUS && scale < 2 ** MOST_HALVINGS && current.width > 2 && current.height > 2) {
		const smaller = run('resample', current, [2, 2, 0, 0], Math.ceil(current.width / 2), Math.ceil(current.height / 2));
		if (current !== source) garbage.push(current);
		current = smaller;
		scale *= 2;
	}
	const reach = radius / scale;
	const across = run('blur', current, [1, 0, reach]);
	const blurred = run('blur', across, [0, 1, reach]);
	garbage.push(across);
	if (current !== source) garbage.push(current);
	let result = blurred;
	if (scale > 1) {
		result = run('resample', blurred, [1 / scale, 1 / scale, 0, 0], source.width, source.height);
		garbage.push(blurred);
	}
	kit.flush();
	for (const texture of garbage) texture.destroy();
	return result;
}
