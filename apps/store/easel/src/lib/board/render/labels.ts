import { device } from '#lib/gpu/device.js';
import { LINE_HEIGHT } from '../geometry';

export interface LabelSpec {
	text: string;
	size: number;
	color: string;
	weight: number;
	width: number | null;
	align: 'left' | 'center';
}

export interface Label {
	texture: GPUTexture;
	width: number;
	height: number;
	lines: number;
	scale: number;
	pixels: number;
}

const MAX_PIXELS = 4096;
const KEEP = 600;
const FRAME_BUDGET_MS = 6;

function wrap(context: OffscreenCanvasRenderingContext2D, text: string, width: number | null) {
	const lines: string[] = [];
	for (const paragraph of text.split('\n')) {
		if (width === null) {
			lines.push(paragraph);
			continue;
		}
		let line = '';
		for (const word of paragraph.split(' ')) {
			const candidate = line ? `${line} ${word}` : word;
			if (line && context.measureText(candidate).width > width) {
				lines.push(line);
				line = word;
			} else line = candidate;
		}
		lines.push(line);
	}
	return lines;
}

export function measureLabel(spec: LabelSpec) {
	const context = new OffscreenCanvas(1, 1).getContext('2d')!;
	context.font = `${spec.weight} ${spec.size}px "Open Runde"`;
	const lines = wrap(context, spec.text, spec.width);
	return { lines, width: spec.width ?? Math.max(1, ...lines.map((line) => context.measureText(line).width)), height: lines.length * spec.size * LINE_HEIGHT };
}

function rasterize(spec: LabelSpec, scale: number): Label {
	const measured = measureLabel(spec);
	const pixels = Math.min(scale, MAX_PIXELS / Math.max(measured.width, measured.height));
	const canvas = new OffscreenCanvas(Math.max(1, Math.ceil(measured.width * pixels)), Math.max(1, Math.ceil(measured.height * pixels)));
	const context = canvas.getContext('2d')!;
	context.font = `${spec.weight} ${spec.size * pixels}px "Open Runde"`;
	context.fillStyle = spec.color;
	context.textAlign = spec.align;
	const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = context.measureText(' ');
	const line = spec.size * LINE_HEIGHT * pixels;
	const x = spec.align === 'center' ? (measured.width * pixels) / 2 : 0;
	measured.lines.forEach((text, row) => context.fillText(text, x, Math.round(row * line + (line + ascent - descent) / 2)));
	const texture = device.createTexture({ size: [canvas.width, canvas.height], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT });
	device.queue.copyExternalImageToTexture({ source: canvas }, { texture, premultipliedAlpha: true }, [canvas.width, canvas.height]);
	return { texture, width: measured.width, height: measured.height, lines: measured.lines.length, scale, pixels };
}

export class Labels {
	#cache = new Map<string, Label>();
	#scale = 0;
	#settled = false;
	#started = 0;
	pending = false;

	begin(scale: number) {
		this.#settled = scale === this.#scale;
		this.#scale = scale;
		this.#started = performance.now();
		this.pending = false;
	}

	#affordable() {
		return this.#settled && performance.now() - this.#started < FRAME_BUDGET_MS;
	}

	get(spec: LabelSpec): Label {
		const key = `${spec.size}|${spec.weight}|${spec.color}|${spec.width}|${spec.align}|${spec.text}`;
		const cached = this.#cache.get(key);
		this.#cache.delete(key);
		const label = cached && (cached.scale === this.#scale || !this.#affordable()) ? cached : rasterize(spec, this.#scale);
		if (label !== cached) cached?.texture.destroy();
		if (label.scale !== this.#scale) this.pending = true;
		this.#cache.set(key, label);
		if (this.#cache.size > KEEP) {
			const [oldest, entry] = this.#cache.entries().next().value!;
			entry.texture.destroy();
			this.#cache.delete(oldest);
		}
		return label;
	}

	destroy() {
		for (const label of this.#cache.values()) label.texture.destroy();
		this.#cache.clear();
	}
}
