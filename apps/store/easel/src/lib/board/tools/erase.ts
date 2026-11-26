import type { ToolEvent } from '#lib/tools/tool.js';
import { hits } from '../geometry';
import type { BoardHandler, BoardHost } from './tool';

const SLOP_PX = 6;

export class EraseTool implements BoardHandler {
	#erasing = false;

	constructor(private readonly host: BoardHost) {}

	down(event: ToolEvent) {
		this.#erasing = true;
		this.host.hidden.clear();
		this.move(event);
	}

	move(event: ToolEvent) {
		if (!this.#erasing) return;
		const { board } = this.host;
		const slop = SLOP_PX / this.host.scale();
		for (const sample of event.samples) {
			for (const object of board.objects) {
				if (object.kind === 'stroke' && !this.host.hidden.has(object.id) && hits(object, sample.x, sample.y, slop, board.lookup)) this.host.hidden.add(object.id);
			}
		}
		this.host.redraw();
	}

	up() {
		this.#erasing = false;
		const { board, hidden } = this.host;
		if (hidden.size) board.commit(this.host.label('easel-history-erase'), board.objects.filter((object) => !hidden.has(object.id)));
		hidden.clear();
		this.host.redraw();
	}
}
