import { canvasFormat, device } from '#lib/gpu/device.js';
import { kit, PREMULTIPLIED } from '#lib/gpu/kit.js';
import { packed, type Matrix } from '#lib/gpu/matrix.js';
import type { Asset } from '../board.svelte';
import { arrowPath, bounds, FRAME_BAND, intersects } from '../geometry';
import { FRAME_TITLE_SIZE, LABEL_SIZE, NOTE_PADDING, NOTE_TEXT_SIZE, type BoardObject, type Box } from '../model';
import { Labels, type Label, type LabelSpec } from './labels';
import { resolve, rgba, type Look } from './look';
import { GRID, IMAGE, SOLID } from './shaders';
import { diamondRing, ellipseRing, FLOATS, Mesh, rectangleRing } from './tessellate';

const SAMPLES = 4;
const HIGHLIGHTER_ALPHA = 0.38;
const NOTE_RADIUS = 10;
const SHAPE_RADIUS = 14;
const FRAME_RADIUS = 12;
const GRID_SPACING = 24;
const SHADOW: [number, number, number, number] = [0, 0, 0, 0.22];

export interface BoardScene {
	objects: BoardObject[];
	lookup: (id: string) => BoardObject | undefined;
	assets: Map<string, Asset>;
	editing?: string | null;
}

interface Cached {
	object: BoardObject;
	look: Look;
	buffer: GPUBuffer | null;
	count: number;
}

function pixelAligned(x: number, y: number, label: Label, view: Matrix): Box {
	const scale = view[0];
	return {
		x: (Math.round(x * scale + view[4]) - view[4]) / scale,
		y: (Math.round(y * scale + view[5]) - view[5]) / scale,
		w: label.texture.width / label.pixels,
		h: label.texture.height / label.pixels
	};
}

function pipeline(code: string, format: GPUTextureFormat, buffers: GPUVertexBufferLayout[] = [], topology: GPUPrimitiveTopology = 'triangle-strip') {
	const module = device.createShaderModule({ code });
	return device.createRenderPipeline({
		layout: 'auto',
		vertex: { module, entryPoint: 'vertexMain', buffers },
		fragment: { module, entryPoint: 'fragmentMain', targets: [{ format, blend: PREMULTIPLIED }] },
		primitive: { topology },
		multisample: { count: SAMPLES }
	});
}

export class BoardRenderer {
	readonly labels = new Labels();
	#solid: GPURenderPipeline;
	#image: GPURenderPipeline;
	#grid: GPURenderPipeline;
	#meshes = new Map<string, Cached>();
	#msaa: GPUTexture | null = null;

	constructor(format: GPUTextureFormat = canvasFormat) {
		this.#solid = pipeline(SOLID, format, [{ arrayStride: FLOATS * 4, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }, { shaderLocation: 1, offset: 8, format: 'float32x4' }] }], 'triangle-list');
		this.#image = pipeline(IMAGE, format);
		this.#grid = pipeline(GRID, format);
	}

	#mesh(object: BoardObject, scene: BoardScene, look: Look): Cached {
		const cached = this.#meshes.get(object.id);
		const attached = object.kind === 'arrow' && (object.from.attach || object.to.attach);
		if (cached && cached.object === object && cached.look === look && !attached) return cached;
		cached?.buffer?.destroy();
		const mesh = new Mesh();
		switch (object.kind) {
			case 'stroke':
				mesh.stroke(rgba(object.color, look, object.tool === 'highlighter' ? HIGHLIGHTER_ALPHA : 1), object.points, object.width);
				break;
			case 'arrow':
				mesh.arrow(rgba(object.color, look), arrowPath(object, scene.lookup), object.width, object.head);
				break;
			case 'frame': {
				const ring = rectangleRing(object.x, object.y, object.w, object.h, FRAME_RADIUS);
				mesh.fan(look.frame, [object.x + object.w / 2, object.y + object.h / 2], ring);
				mesh.outline(look.frameLine, ring, 1);
				break;
			}
			case 'shape': {
				const ring = object.shape === 'ellipse' ? ellipseRing(object.x, object.y, object.w, object.h) : object.shape === 'diamond' ? diamondRing(object.x, object.y, object.w, object.h) : rectangleRing(object.x, object.y, object.w, object.h, SHAPE_RADIUS);
				if (object.fill) mesh.fan(rgba(object.fill, look), [object.x + object.w / 2, object.y + object.h / 2], ring);
				mesh.outline(rgba(object.color, look), ring, 2);
				break;
			}
			case 'note': {
				mesh.fan(SHADOW, [object.x + object.w / 2, object.y + object.h / 2 + 5], rectangleRing(object.x + 2, object.y + 6, object.w - 4, object.h, NOTE_RADIUS));
				mesh.fan(rgba(object.color, look), [object.x + object.w / 2, object.y + object.h / 2], rectangleRing(object.x, object.y, object.w, object.h, NOTE_RADIUS));
				break;
			}
		}
		const data = mesh.finish();
		let buffer: GPUBuffer | null = null;
		if (data.length) {
			buffer = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
			device.queue.writeBuffer(buffer, 0, data);
		}
		const entry = { object, look, buffer, count: data.length / FLOATS };
		this.#meshes.set(object.id, entry);
		return entry;
	}

	#label(object: BoardObject, look: Look): (LabelSpec & { box: Box }) | null {
		if (object.kind === 'text' && object.text) return { text: object.text, size: object.size, color: resolve(object.color, look), weight: 500, width: null, align: 'left', box: { x: object.x, y: object.y, w: 0, h: 0 } };
		if (object.kind === 'note' && object.text)
			return { text: object.text, size: NOTE_TEXT_SIZE, color: look.noteText, weight: 500, width: object.w - NOTE_PADDING * 2, align: 'left', box: { x: object.x + NOTE_PADDING, y: object.y + NOTE_PADDING, w: 0, h: 0 } };
		if (object.kind === 'shape' && object.text)
			return { text: object.text, size: LABEL_SIZE, color: resolve(object.color, look), weight: 600, width: Math.max(LABEL_SIZE, object.w - 20), align: 'center', box: { x: object.x + 10, y: object.y + object.h / 2, w: 0, h: -1 } };
		if (object.kind === 'frame' && object.text)
			return { text: object.text, size: FRAME_TITLE_SIZE, color: look.frameTitle, weight: 600, width: null, align: 'left', box: { x: object.x + 2, y: object.y - FRAME_BAND, w: 0, h: 0 } };
		return null;
	}

	render(pass: GPURenderPassEncoder, scene: BoardScene, view: Matrix, width: number, height: number, look: Look, hidden: Set<string>, grid: boolean) {
		const scale = view[0];
		const viewData = new Float32Array(16);
		packed(view, viewData);
		viewData.set([width, height, scale, 0], 12);
		const viewBinding = kit.uniform(viewData);
		const visible: Box = { x: -view[4] / scale, y: -view[5] / scale, w: width / scale, h: height / scale };
		if (grid) {
			let spacing = GRID_SPACING;
			while (spacing * scale < 12) spacing *= 4;
			pass.setPipeline(this.#grid);
			pass.setBindGroup(0, kit.group(this.#grid, [viewBinding]));
			pass.setBindGroup(1, kit.group(this.#grid, [kit.uniform(new Float32Array([...look.grid, spacing, Math.max(0.8, 1.2 * Math.min(1, scale)), 0, 0]))], 1));
			pass.draw(3);
		}
		this.labels.begin(scale);
		const solidGroup = kit.group(this.#solid, [viewBinding]);
		const imageGroup = kit.group(this.#image, [viewBinding]);
		const alive = new Set<string>();
		for (const object of scene.objects) {
			alive.add(object.id);
			if (hidden.has(object.id) || !intersects(bounds(object, scene.lookup), visible)) continue;
			const mesh = this.#mesh(object, scene, look);
			if (mesh.buffer) {
				pass.setPipeline(this.#solid);
				pass.setBindGroup(0, solidGroup);
				pass.setVertexBuffer(0, mesh.buffer);
				pass.draw(mesh.count);
			}
			if (object.kind === 'picture') {
				const asset = scene.assets.get(object.asset);
				const texture = asset && this.#pictures.get(object.asset, asset.bitmap);
				if (texture) this.#quad(pass, imageGroup, { x: object.x, y: object.y, w: object.w, h: object.h }, texture);
			}
			const label = object.id === scene.editing ? null : this.#label(object, look);
			if (label) {
				const drawn = this.labels.get(label);
				const y = label.box.h === -1 ? label.box.y - drawn.height / 2 : label.box.y;
				const x = label.align === 'center' && label.width ? label.box.x + (label.width - drawn.width) / 2 : label.box.x;
				this.#quad(pass, imageGroup, pixelAligned(x, y, drawn, view), drawn.texture);
			}
		}
		for (const [id, cached] of this.#meshes) {
			if (alive.has(id)) continue;
			cached.buffer?.destroy();
			this.#meshes.delete(id);
		}
	}

	#pictures = new PictureTextures();

	#quad(pass: GPURenderPassEncoder, viewGroup: GPUBindGroup, box: Box, texture: GPUTexture) {
		pass.setPipeline(this.#image);
		pass.setBindGroup(0, viewGroup);
		pass.setBindGroup(1, kit.group(this.#image, [kit.uniform(new Float32Array([box.x, box.y, box.w, box.h, 1, 1, 1, 1])), texture.createView(), kit.linear], 1));
		pass.draw(4);
	}

	target(view: GPUTextureView, width: number, height: number, format: GPUTextureFormat, clearValue: GPUColor = [0, 0, 0, 0]) {
		if (!this.#msaa || this.#msaa.width !== width || this.#msaa.height !== height || this.#msaa.format !== format) {
			this.#msaa?.destroy();
			this.#msaa = device.createTexture({ size: [width, height], format, sampleCount: SAMPLES, usage: GPUTextureUsage.RENDER_ATTACHMENT });
		}
		return { view: this.#msaa.createView(), resolveTarget: view, loadOp: 'clear' as const, clearValue, storeOp: 'discard' as const };
	}

	destroy() {
		for (const cached of this.#meshes.values()) cached.buffer?.destroy();
		this.#meshes.clear();
		this.labels.destroy();
		this.#pictures.destroy();
		this.#msaa?.destroy();
	}
}

class PictureTextures {
	#textures = new Map<string, { bitmap: ImageBitmap; texture: GPUTexture }>();

	get(id: string, bitmap: ImageBitmap) {
		const cached = this.#textures.get(id);
		if (cached?.bitmap === bitmap) return cached.texture;
		cached?.texture.destroy();
		const texture = device.createTexture({ size: [bitmap.width, bitmap.height], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT });
		device.queue.copyExternalImageToTexture({ source: bitmap }, { texture, premultipliedAlpha: true }, [bitmap.width, bitmap.height]);
		this.#textures.set(id, { bitmap, texture });
		return texture;
	}

	destroy() {
		for (const { texture } of this.#textures.values()) texture.destroy();
		this.#textures.clear();
	}
}
