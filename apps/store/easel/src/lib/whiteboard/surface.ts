import { canvasFormat, device } from '#lib/gpu/device.js';
import { kit } from '#lib/gpu/kit.js';
import type { BoardRenderer } from '#lib/board/render/renderer.js';
import type { Look } from '#lib/board/render/look.js';
import type { Surface } from '#lib/viewport/surface.js';
import type { Whiteboard } from './whiteboard.svelte';

export class BoardSurface implements Surface {
	readonly context: GPUCanvasContext;
	#frame = 0;

	constructor(
		private readonly canvas: HTMLCanvasElement,
		private readonly whiteboard: Whiteboard,
		private readonly renderer: BoardRenderer,
		private readonly look: () => Look
	) {
		this.context = canvas.getContext('webgpu')!;
		this.context.configure({ device, format: canvasFormat, alphaMode: 'premultiplied' });
	}

	invalidate = () => {
		this.#frame ||= requestAnimationFrame(() => {
			this.#frame = 0;
			this.draw();
		});
	};

	draw() {
		const { width, height } = this.canvas;
		const { board, viewport, live, hidden } = this.whiteboard;
		const pass = kit.begin().beginRenderPass({ colorAttachments: [this.renderer.target(this.context.getCurrentTexture().createView(), width, height, canvasFormat)] });
		const look = this.look();
		const objects = live ? [...board.objects, live] : board.objects;
		this.renderer.render(pass, { objects, lookup: board.lookup, assets: board.assets }, viewport.matrix(), width, height, look, hidden, true);
		pass.end();
		kit.flush();
	}

	destroy() {
		cancelAnimationFrame(this.#frame);
		this.context.unconfigure();
	}
}
