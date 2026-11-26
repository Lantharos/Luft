import { canvasFormat, device } from './device';
import { kit, PREMULTIPLIED } from './kit';
import { packed, packedProjective, projective, IDENTITY, type Matrix, type Projective } from './matrix';
import { ANTS, CHECKER, PRESENT, PRESENT_MASK, QUICK_MASK } from './shaders/view';
import { TILE, type Rect, type TileGrid } from './tiles';

const PIXELATED_FROM = 2;
const FLAT = projective(IDENTITY);
const ANTS_FRAME = 80;

export interface Floating {
	grid: TileGrid;
	matrix: Projective;
}

export interface Scene {
	view: Matrix;
	width: number;
	height: number;
	levels: TileGrid[];
	floating: Floating | null;
	selection: TileGrid | null;
	checker: [number[], number[]];
	mono?: boolean;
	quickMask?: { selection: TileGrid; stroke: TileGrid | null; mode: number; opacity: number } | null;
}

function pipeline(code: string) {
	const module = device.createShaderModule({ code });
	return device.createRenderPipeline({
		layout: 'auto',
		vertex: { module, entryPoint: 'vertexMain' },
		fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: canvasFormat, blend: PREMULTIPLIED }] },
		primitive: { topology: 'triangle-strip' }
	});
}

interface Pipelines {
	present: GPURenderPipeline;
	checker: GPURenderPipeline;
	ants: GPURenderPipeline;
	mask: GPURenderPipeline;
	quick: GPURenderPipeline;
}

let shared: Pipelines | null = null;

export class Presenter {
	readonly context: GPUCanvasContext;
	#pipelines: Pipelines;
	#frame = 0;
	#scene: () => Scene | null;
	#time = performance.now();

	constructor(
		readonly canvas: HTMLCanvasElement,
		scene: () => Scene | null
	) {
		this.context = canvas.getContext('webgpu')!;
		this.context.configure({ device, format: canvasFormat, alphaMode: 'premultiplied' });
		shared ??= { present: pipeline(PRESENT), checker: pipeline(CHECKER), ants: pipeline(ANTS), mask: pipeline(PRESENT_MASK), quick: pipeline(QUICK_MASK) };
		this.#pipelines = shared;
		this.#scene = scene;
	}

	invalidate = () => {
		this.#frame ||= requestAnimationFrame(() => {
			this.#frame = 0;
			this.draw();
		});
	};

	draw() {
		const scene = this.#scene();
		const { width, height } = this.canvas;
		const encoder = kit.begin();
		const pass = encoder.beginRenderPass({
			colorAttachments: [{ view: this.context.getCurrentTexture().createView(), loadOp: 'clear', clearValue: [0, 0, 0, 0], storeOp: 'store' }]
		});
		if (scene) this.#drawScene(pass, scene, width, height);
		pass.end();
		kit.flush();
		if (scene?.selection) setTimeout(this.invalidate, ANTS_FRAME);
	}

	#drawScene(pass: GPURenderPassEncoder, scene: Scene, width: number, height: number) {
		const { checker, ants } = this.#pipelines;
		const present = scene.mono ? this.#pipelines.mask : this.#pipelines.present;
		const scale = Math.hypot(scene.view[0], scene.view[1]);
		const viewData = new Float32Array(16);
		packed(scene.view, viewData);
		viewData.set([width, height, (performance.now() - this.#time) / 1000, scale], 12);
		const viewBinding = kit.uniform(viewData);

		pass.setPipeline(checker);
		pass.setBindGroup(0, kit.group(checker, [viewBinding]));
		const [light, dark] = scene.checker;
		pass.setBindGroup(1, kit.group(checker, [kit.uniform(new Float32Array([0, 0, scene.width, scene.height, ...light, ...dark]))], 1));
		pass.draw(4);

		const level = Math.max(0, Math.min(scene.levels.length - 1, Math.floor(Math.log2(1 / scale))));
		const sampler = scale >= PIXELATED_FROM ? kit.nearest : kit.linear;
		const visible = this.#visible(scene, width, height);
		pass.setPipeline(present);
		pass.setBindGroup(0, kit.group(present, [viewBinding]));
		const grid = scene.levels[level];
		for (const index of grid.indicesIn(visible)) {
			const texture = grid.get(index);
			if (texture) this.#quad(pass, present, FLAT, grid.rectOf(index), texture, sampler);
		}
		if (scene.floating) {
			const floating = scene.floating.grid;
			for (const [index, texture] of floating.tiles) this.#quad(pass, present, scene.floating.matrix, floating.rectOf(index), texture, scale >= PIXELATED_FROM ? kit.nearest : kit.linear);
		}
		if (scene.quickMask) {
			const { quick } = this.#pipelines;
			const { selection, stroke, mode, opacity } = scene.quickMask;
			pass.setPipeline(quick);
			pass.setBindGroup(0, kit.group(quick, [viewBinding]));
			for (const index of selection.indicesIn(visible)) {
				const data = new Float32Array(20);
				packedProjective(FLAT, data);
				const rect = selection.rectOf(index);
				data.set([rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width / TILE, rect.height / TILE], 12);
				const strokeValues = new Float32Array(4);
				new Uint32Array(strokeValues.buffer)[0] = mode;
				strokeValues[1] = opacity;
				pass.setBindGroup(1, kit.group(quick, [kit.uniform(data), selection.get(index)?.createView() ?? kit.clear, kit.linear, stroke?.get(index)?.createView() ?? kit.clear, kit.uniform(strokeValues)], 1));
				pass.draw(4);
			}
		} else if (scene.selection) {
			pass.setPipeline(ants);
			pass.setBindGroup(0, kit.group(ants, [viewBinding]));
			for (const index of scene.selection.indicesIn(visible)) {
				const texture = scene.selection.get(index);
				if (texture) this.#quad(pass, ants, scene.floating?.matrix ?? FLAT, scene.selection.rectOf(index), texture, kit.linear);
			}
		}
	}

	#quad(pass: GPURenderPassEncoder, use: GPURenderPipeline, model: Projective, rect: Rect, texture: GPUTexture, sampler: GPUSampler) {
		const data = new Float32Array(20);
		packedProjective(model, data);
		data.set([rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width / TILE, rect.height / TILE], 12);
		pass.setBindGroup(1, kit.group(use, [kit.uniform(data), texture.createView(), sampler], 1));
		pass.draw(4);
	}

	#visible(scene: Scene, width: number, height: number): Rect {
		const [a, , , d, e, f] = scene.view;
		const x = -e / a;
		const y = -f / d;
		return { x, y, width: width / a, height: height / d };
	}

	destroy() {
		cancelAnimationFrame(this.#frame);
		this.context.unconfigure();
	}
}
