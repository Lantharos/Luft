import { ADJUSTMENT_LAYER } from './shaders/adjustment';
import { adjustValues, type Adjust } from './shaders/adjust';
import { BLEND_MODES, type BlendMode } from './shaders/blend';
import { kit } from './kit';
import { device } from './device';
import { newTile, TILE, TileGrid } from './tiles';

export const LEVELS = 5;

export interface LiveStroke {
	grid: TileGrid;
	color: [number, number, number, number];
	opacity: number;
	erase: boolean;
	mask: boolean;
	clone: { source: GPUTexture; low: GPUTexture | null; offset: [number, number] } | null;
}

interface Shared {
	mask: TileGrid | null;
	opacity: number;
	visible: boolean;
}

export type CompositeNode =
	| (Shared & { kind: 'pixels'; pixels: TileGrid; blend: BlendMode; stroke: LiveStroke | null; adjust: Adjust | null })
	| (Shared & { kind: 'adjustment'; lut: GPUTexture; mode: number; values: number[] })
	| (Shared & { kind: 'group'; children: CompositeNode[]; blend: BlendMode });

export function blendTile(target: GPUTexture, backdrop: GPUTextureView, layer: GPUTextureView, mask: GPUTextureView, opacity: number, blend: BlendMode, stroke: LiveStroke | null, adjust: Adjust | null, selection: TileGrid | null, index: number) {
	const data = new ArrayBuffer(96);
	const floats = new Float32Array(data);
	const words = new Uint32Array(data);
	const strokeTile = stroke?.grid.get(index);
	floats.set(stroke?.color ?? [0, 0, 0, 0], 0);
	floats[4] = opacity;
	words[5] = BLEND_MODES.indexOf(blend);
	words[6] = strokeTile ? (stroke!.erase ? 2 : 1) : 0;
	floats[7] = stroke?.opacity ?? 0;
	floats.set(adjustValues(adjust), 8);
	words[13] = adjust ? 1 : 0;
	words[16] = stroke?.mask ? 1 : 0;
	const clone = strokeTile ? stroke!.clone : null;
	words[17] = clone ? (clone.low ? 2 : 1) : 0;
	const origin = stroke?.grid.rectOf(index);
	floats.set([clone?.offset[0] ?? 0, clone?.offset[1] ?? 0, origin?.x ?? 0, origin?.y ?? 0], 20);
	kit.fill(target, kit.composite, [
		backdrop,
		layer,
		strokeTile?.createView() ?? kit.clear,
		selection?.get(index)?.createView() ?? (selection ? kit.clear : kit.full),
		mask,
		kit.uniform(floats),
		clone?.source.createView() ?? kit.clear,
		clone?.low?.createView() ?? kit.clear,
		kit.linear
	]);
}

let adjustmentPipeline: GPURenderPipeline | null = null;

function adjustmentLayer() {
	if (adjustmentPipeline) return adjustmentPipeline;
	const module = device.createShaderModule({ code: ADJUSTMENT_LAYER });
	adjustmentPipeline = device.createRenderPipeline({
		layout: 'auto',
		vertex: { module, entryPoint: 'vertexMain' },
		fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: 'rgba8unorm' }] },
		primitive: { topology: 'triangle-strip' }
	});
	return adjustmentPipeline;
}

function touches(node: CompositeNode, index: number): boolean {
	if (!node.visible || node.opacity <= 0) return false;
	if (node.kind === 'pixels') return Boolean(node.pixels.get(index) || (node.stroke && !node.stroke.erase && !node.stroke.mask && node.stroke.grid.get(index)));
	if (node.kind === 'group') return node.children.some((child) => touches(child, index));
	return true;
}

export class Compositor {
	readonly levels: TileGrid[];
	#pool: GPUTexture[] = [];

	constructor(
		readonly width: number,
		readonly height: number
	) {
		this.levels = Array.from({ length: LEVELS }, () => new TileGrid(width, height));
	}

	#take() {
		return this.#pool.pop() ?? newTile();
	}

	#give(texture: GPUTexture) {
		this.#pool.push(texture);
	}

	render(indices: Iterable<number>, nodes: CompositeNode[], selection: TileGrid | null) {
		for (const index of indices) this.#tile(index, nodes, selection);
	}

	#stack(nodes: CompositeNode[], index: number, selection: TileGrid | null): GPUTexture | null {
		let result: GPUTexture | null = null;
		for (const node of nodes) {
			if (!touches(node, index) && node.kind !== 'adjustment') continue;
			if (!node.visible || node.opacity <= 0) continue;
			if (node.kind === 'adjustment' && !result) continue;
			const target = this.#take();
			const backdrop = result?.createView() ?? kit.clear;
			const mask = node.mask?.get(index)?.createView() ?? kit.full;
			if (node.kind === 'adjustment') {
				const params = new Float32Array(12);
				params.set(node.values.slice(0, 8));
				new Uint32Array(params.buffer)[8] = node.mode;
				params[9] = node.opacity;
				const use = adjustmentLayer();
				kit.fill(target, use, [backdrop, node.lut.createView(), mask, kit.uniform(params)]);
			} else if (node.kind === 'group') {
				const inner = this.#stack(node.children, index, selection);
				if (!inner) {
					this.#give(target);
					continue;
				}
				blendTile(target, backdrop, inner.createView(), mask, node.opacity, node.blend, null, null, selection, index);
				this.#give(inner);
			} else {
				blendTile(target, backdrop, node.pixels.get(index)?.createView() ?? kit.clear, mask, node.opacity, node.blend, node.stroke, node.adjust, selection, index);
			}
			if (result) this.#give(result);
			result = target;
		}
		return result;
	}

	#tile(index: number, nodes: CompositeNode[], selection: TileGrid | null) {
		const result = this.#stack(nodes, index, selection);
		const base = this.levels[0];
		if (!result) {
			for (const level of this.levels) {
				level.get(index)?.destroy();
				level.set(index, undefined);
			}
			return;
		}
		let target = base.get(index);
		if (!target) base.set(index, (target = newTile()));
		kit.copy(result, target);
		this.#give(result);
		for (let level = 1; level < LEVELS; level++) {
			const grid = this.levels[level];
			let smaller = grid.get(index);
			if (!smaller) grid.set(index, (smaller = newTile('rgba8unorm', TILE >> level)));
			kit.fill(smaller, kit.downsample, [this.levels[level - 1].get(index)!.createView()]);
		}
	}

	destroy() {
		for (const level of this.levels) level.destroy();
		for (const texture of this.#pool) texture.destroy();
	}
}
