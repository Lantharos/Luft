import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { Overlay } from '#lib/editor/overlay.js';
import { kit } from '#lib/gpu/kit.js';
import { premultiplied } from '#lib/raster/color.js';
import type { ToolEvent, ToolHandler } from './tool';

export interface GradientHost {
	doc: ImageDocument;
	colors(): [string, string];
	radial(): boolean;
	show(overlay: Overlay | null): void;
	label: string;
}

export class GradientTool implements ToolHandler {
	readonly cursor = 'crosshair';
	#from: [number, number] | null = null;
	#to: [number, number] = [0, 0];

	constructor(private readonly host: GradientHost) {}

	down(event: ToolEvent) {
		if (this.host.doc.active.locked || this.host.doc.active.kind !== 'raster') return;
		this.#from = [event.x, event.y];
		this.#to = [event.x, event.y];
	}

	move(event: ToolEvent) {
		if (!this.#from) return;
		this.#to = [event.x, event.y];
		if (event.shift) {
			const angle = Math.round(Math.atan2(event.y - this.#from[1], event.x - this.#from[0]) / (Math.PI / 4)) * (Math.PI / 4);
			const length = Math.hypot(event.x - this.#from[0], event.y - this.#from[1]);
			this.#to = [this.#from[0] + Math.cos(angle) * length, this.#from[1] + Math.sin(angle) * length];
		}
		this.host.show({ kind: 'line', from: this.#from, to: this.#to });
	}

	up() {
		const from = this.#from;
		this.#from = null;
		this.host.show(null);
		if (!from || Math.hypot(this.#to[0] - from[0], this.#to[1] - from[1]) < 1) return;
		const { doc } = this.host;
		const [start, end] = this.host.colors().map(premultiplied);
		const selection = doc.selectionActive ? doc.selection : null;
		const radial = this.host.radial();
		const to = this.#to;
		const indices = selection ? [...selection.tiles.keys()] : doc.active.pixels.all();
		doc.paint(this.host.label, doc.active, indices, (index, target, before) => {
			const rect = doc.active.pixels.rectOf(index);
			const params = new Float32Array(16);
			params.set([...start, ...end, ...from, ...to, rect.x, rect.y, 0, 1]);
			new Uint32Array(params.buffer)[14] = radial ? 1 : 0;
			kit.fill(target, kit.gradient, [before?.createView() ?? kit.clear, selection ? (selection.get(index)?.createView() ?? kit.clear) : kit.full, kit.uniform(params)]);
		});
	}
}
