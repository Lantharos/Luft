import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Layer } from '#lib/document/layers.svelte.js';
import { device } from '#lib/gpu/device.js';
import { texture } from '#lib/gpu/filters.js';
import { kit, PREMULTIPLIED } from '#lib/gpu/kit.js';
import { SMUDGE_DAB } from '#lib/gpu/shaders/smudge.js';
import { newTile, TileGrid } from '#lib/gpu/tiles.js';
import type { BrushSettings } from '#lib/gpu/brush.js';
import { assemble } from '#lib/raster/transform.js';
import type { ToolEvent, ToolHandler } from '../tool';

const SPACING = 0.2;

let dabPipeline: GPURenderPipeline | null = null;

function pipeline() {
	if (dabPipeline) return dabPipeline;
	const module = device.createShaderModule({ code: SMUDGE_DAB });
	dabPipeline = device.createRenderPipeline({
		layout: 'auto',
		vertex: { module, entryPoint: 'vertexMain' },
		fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: 'rgba8unorm', blend: PREMULTIPLIED }] },
		primitive: { topology: 'triangle-strip' }
	});
	return dabPipeline;
}

export class SmudgeTool implements ToolHandler {
	readonly cursor = 'none';
	#work: GPUTexture | null = null;
	#carry: GPUTexture | null = null;
	#layer: Layer | null = null;
	#preview: TileGrid | null = null;
	#last: [number, number] | null = null;
	#touched = new Set<number>();

	constructor(
		private readonly doc: ImageDocument,
		private readonly brush: () => BrushSettings,
		private readonly label: string
	) {}

	down(event: ToolEvent) {
		const layer = this.doc.active;
		if (!layer.paintable) return;
		this.#layer = layer;
		this.#work = assemble(layer.pixels);
		const size = Math.max(2, Math.ceil(this.brush().size));
		this.#carry = texture(size, size);
		this.#preview = new TileGrid(this.doc.width, this.doc.height);
		for (const [index, tile] of layer.pixels.tiles) this.#preview.set(index, tile);
		this.doc.preview = { layer: layer.id, grid: this.#preview };
		this.#last = [event.x, event.y];
		this.#touched.clear();
	}

	move(event: ToolEvent) {
		if (!this.#work || !this.#last) return;
		const brush = this.brush();
		const radius = Math.max(1, brush.size / 2);
		const step = Math.max(1, radius * 2 * SPACING);
		for (const sample of event.samples) {
			const last: [number, number] = this.#last;
			let x = last[0];
			let y = last[1];
			let distance = Math.hypot(sample.x - x, sample.y - y);
			while (distance >= step) {
				const share = step / distance;
				const nx = x + (sample.x - x) * share;
				const ny = y + (sample.y - y) * share;
				this.#dab([x, y], [nx, ny], radius, brush.opacity * sample.pressure, brush.hardness);
				x = nx;
				y = ny;
				distance -= step;
			}
			this.#last = [x, y];
		}
		this.#publish();
	}

	#dab(from: [number, number], to: [number, number], radius: number, strength: number, hardness: number) {
		const work = this.#work!;
		const carry = this.#carry!;
		const size = carry.width;
		const left = Math.round(from[0] - size / 2);
		const top = Math.round(from[1] - size / 2);
		const x = Math.max(0, Math.min(work.width - size, left));
		const y = Math.max(0, Math.min(work.height - size, top));
		const encoder = kit.begin();
		encoder.copyTextureToTexture({ texture: work, origin: [x, y] }, { texture: carry }, [Math.min(size, work.width), Math.min(size, work.height)]);
		const params = new Float32Array([to[0], to[1], radius, strength, work.width, work.height, hardness, 0]);
		const pass = kit.pass(work.createView());
		pass.setPipeline(pipeline());
		pass.setBindGroup(0, kit.group(pipeline(), [carry.createView(), kit.linear, kit.uniform(params)]));
		pass.draw(4);
		pass.end();
		for (const index of this.#preview!.indicesIn({ x: to[0] - radius, y: to[1] - radius, width: radius * 2, height: radius * 2 })) this.#touched.add(index);
	}

	#publish() {
		const preview = this.#preview!;
		const work = this.#work!;
		const encoder = kit.begin();
		for (const index of this.#touched) {
			let tile = preview.get(index);
			if (!tile || tile === this.#layer!.pixels.get(index)) preview.set(index, (tile = newTile()));
			const rect = preview.rectOf(index);
			encoder.copyTextureToTexture({ texture: work, origin: [rect.x, rect.y] }, { texture: tile }, [rect.width, rect.height]);
		}
		kit.flush();
		this.doc.invalidate([...this.#touched]);
	}

	up() {
		const layer = this.#layer;
		const preview = this.#preview;
		if (!layer || !preview || !this.#work) return;
		this.doc.preview = null;
		const touched = [...this.#touched];
		this.doc.paint(this.label, layer, touched, (index, target) => kit.copy(preview.get(index)!, target));
		kit.flush();
		for (const [index, tile] of preview.tiles) if (tile !== layer.pixels.get(index) && !touched.includes(index)) tile.destroy();
		for (const index of touched) preview.get(index)?.destroy();
		this.#work.destroy();
		this.#carry?.destroy();
		this.#work = this.#carry = this.#layer = this.#preview = null;
		this.#last = null;
	}
}
