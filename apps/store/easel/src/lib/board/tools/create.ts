import type { ToolEvent } from '#lib/tools/tool.js';
import { hits } from '../geometry';
import { isBoxed, NOTE_SIZE, objectId, TEXT_SIZE, type Arrow, type BoardObject, type Box, type End, type Frame, type Shape } from '../model';
import type { BoardHandler, BoardHost } from './tool';

const MIN_DRAG = 4;
const DEFAULT_SHAPE = { w: 180, h: 100 };
const DEFAULT_FRAME = { w: 640, h: 400 };
const ARROW_WIDTH = 2.5;

export function attachAt(host: BoardHost, x: number, y: number, except: string | null = null): End {
	const { board } = host;
	const target = [...board.objects].reverse().find((object) => isBoxed(object) && object.id !== except && hits(object, x, y, 0, board.lookup));
	return target ? { x, y, attach: target.id } : { x, y };
}

export class ShapeTool implements BoardHandler {
	#start: [number, number] | null = null;

	constructor(private readonly host: BoardHost) {}

	down(event: ToolEvent) {
		this.#start = [event.x, event.y];
	}

	move(event: ToolEvent) {
		const start = this.#start;
		if (!start) return;
		let w = event.x - start[0];
		let h = event.y - start[1];
		if (event.shift) {
			const side = Math.max(Math.abs(w), Math.abs(h));
			w = side * Math.sign(w || 1);
			h = side * Math.sign(h || 1);
		}
		this.host.live = this.#shape(start, w, h);
		this.host.redraw();
	}

	#shape(start: [number, number], w: number, h: number): Shape {
		return { id: objectId(), kind: 'shape', shape: this.host.shape(), x: Math.min(start[0], start[0] + w), y: Math.min(start[1], start[1] + h), w: Math.abs(w), h: Math.abs(h), color: this.host.ink(), fill: null, text: '' };
	}

	up(event: ToolEvent) {
		const start = this.#start;
		this.#start = null;
		if (!start) return;
		const dragged = Math.hypot(event.x - start[0], event.y - start[1]) * this.host.scale() > MIN_DRAG;
		const shape = dragged && this.host.live ? (this.host.live as Shape) : this.#shape([start[0] - DEFAULT_SHAPE.w / 2, start[1] - DEFAULT_SHAPE.h / 2], DEFAULT_SHAPE.w, DEFAULT_SHAPE.h);
		this.host.live = null;
		const { board } = this.host;
		board.commit(this.host.label('easel-history-shape'), [...board.objects, shape]);
		board.select([shape.id]);
		if (!dragged) this.host.edit(shape.id);
	}
}

export class ArrowTool implements BoardHandler {
	#from: End | null = null;

	constructor(private readonly host: BoardHost) {}

	down(event: ToolEvent) {
		this.#from = attachAt(this.host, event.x, event.y);
	}

	move(event: ToolEvent) {
		if (!this.#from) return;
		this.host.live = this.#arrow(this.#from, attachAt(this.host, event.x, event.y, this.#from.attach ?? null));
		this.host.redraw();
	}

	#arrow(from: End, to: End): Arrow {
		return { id: objectId(), kind: 'arrow', from, to, route: this.host.route(), color: this.host.ink(), width: ARROW_WIDTH, head: true };
	}

	up(event: ToolEvent) {
		const from = this.#from;
		this.#from = null;
		this.host.live = null;
		if (!from || Math.hypot(event.x - from.x, event.y - from.y) * this.host.scale() < MIN_DRAG) return this.host.redraw();
		const arrow = this.#arrow(from, attachAt(this.host, event.x, event.y, from.attach ?? null));
		const { board } = this.host;
		board.commit(this.host.label('easel-history-arrow'), [...board.objects, arrow]);
	}
}

function dragged(start: [number, number], event: ToolEvent): Box {
	return { x: Math.min(start[0], event.x), y: Math.min(start[1], event.y), w: Math.abs(event.x - start[0]), h: Math.abs(event.y - start[1]) };
}

export class FrameTool implements BoardHandler {
	#start: [number, number] | null = null;

	constructor(private readonly host: BoardHost) {}

	#frame(box: Box): Frame {
		const number = this.host.board.objects.filter((object) => object.kind === 'frame').length + 1;
		return { id: objectId(), kind: 'frame', ...box, text: this.host.label('easel-frame-name', { number }) };
	}

	down(event: ToolEvent) {
		this.#start = [event.x, event.y];
	}

	move(event: ToolEvent) {
		if (!this.#start) return;
		this.host.live = this.#frame(dragged(this.#start, event));
		this.host.redraw();
	}

	up(event: ToolEvent) {
		const start = this.#start;
		this.#start = null;
		this.host.live = null;
		if (!start) return;
		const box = Math.hypot(event.x - start[0], event.y - start[1]) * this.host.scale() > MIN_DRAG ? dragged(start, event) : { x: start[0] - DEFAULT_FRAME.w / 2, y: start[1] - DEFAULT_FRAME.h / 2, ...DEFAULT_FRAME };
		const frame = this.#frame(box);
		const { board } = this.host;
		board.commit(this.host.label('easel-history-frame'), [frame, ...board.objects]);
		board.select([frame.id]);
	}
}

export class PlaceTool implements BoardHandler {
	constructor(
		private readonly host: BoardHost,
		private readonly kind: 'text' | 'note'
	) {}

	down(event: ToolEvent) {
		const object: BoardObject =
			this.kind === 'text'
				? { id: objectId(), kind: 'text', x: event.x, y: event.y - TEXT_SIZE * 0.65, text: '', size: TEXT_SIZE, color: this.host.ink() }
				: { id: objectId(), kind: 'note', x: event.x - NOTE_SIZE / 2, y: event.y - NOTE_SIZE / 2, w: NOTE_SIZE, h: NOTE_SIZE, color: this.host.noteColor(), text: '' };
		const { board } = this.host;
		board.commit(this.host.label(this.kind === 'text' ? 'easel-history-text' : 'easel-history-note'), [...board.objects, object]);
		board.select([object.id]);
		this.host.edit(object.id);
	}
}
