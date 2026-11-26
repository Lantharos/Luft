import type { ImageDocument } from '#lib/document/image.svelte.js';
import { toHex } from '#lib/raster/color.js';
import { readRegion } from '#lib/raster/readback.js';
import type { ToolEvent, ToolHandler } from './tool';

export class PickerTool implements ToolHandler {
	readonly cursor = 'crosshair';
	#picking = false;

	constructor(
		private readonly doc: ImageDocument,
		private readonly pick: (color: string, secondary: boolean) => void
	) {}

	down(event: ToolEvent) {
		this.#picking = true;
		void this.#sample(event);
	}

	move(event: ToolEvent) {
		if (this.#picking) void this.#sample(event);
	}

	up() {
		this.#picking = false;
	}

	async #sample(event: ToolEvent) {
		const x = Math.floor(event.x);
		const y = Math.floor(event.y);
		if (x < 0 || y < 0 || x >= this.doc.width || y >= this.doc.height) return;
		const [r, g, b, a] = await readRegion(this.doc.compositor.levels[0], { x, y, width: 1, height: 1 });
		if (!a) return;
		this.pick(toHex((r * 255) / a, (g * 255) / a, (b * 255) / a), event.alt);
	}
}
