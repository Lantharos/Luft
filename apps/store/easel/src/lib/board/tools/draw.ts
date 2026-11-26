import type { ToolEvent } from '#lib/tools/tool.js';
import { objectId, type BoardObject, type Stroke } from '../model';
import { recognize } from '../recognize';
import type { BoardHandler, BoardHost } from './tool';

const HOLD_MS = 450;
const HOLD_SLOP = 3;
const PEN_WIDTH = 3;
const HIGHLIGHTER_WIDTH = 18;

export class DrawTool implements BoardHandler {
	#stroke: Stroke | null = null;
	#shape: BoardObject | null = null;
	#timer = 0;
	#still: [number, number] = [0, 0];

	constructor(
		private readonly host: BoardHost,
		private readonly tool: 'pen' | 'highlighter'
	) {}

	down(event: ToolEvent) {
		const width = this.tool === 'pen' ? PEN_WIDTH : HIGHLIGHTER_WIDTH;
		this.#shape = null;
		this.#stroke = { id: objectId(), kind: 'stroke', tool: this.tool, color: this.host.ink(), width, points: [] };
		this.#add(event);
	}

	move(event: ToolEvent) {
		if (!this.#stroke || this.#shape) return;
		this.#add(event);
	}

	#add(event: ToolEvent) {
		const stroke = this.#stroke!;
		const points = [...stroke.points];
		for (const sample of event.samples) points.push(sample.x, sample.y, this.tool === 'pen' ? sample.pressure : 1);
		this.#stroke = { ...stroke, points };
		this.host.live = this.#stroke;
		this.host.redraw();
		if (Math.hypot(event.x - this.#still[0], event.y - this.#still[1]) * this.host.scale() > HOLD_SLOP) {
			this.#still = [event.x, event.y];
			clearTimeout(this.#timer);
			this.#timer = window.setTimeout(() => this.#straighten(), HOLD_MS);
		}
	}

	#straighten() {
		const stroke = this.#stroke;
		if (!stroke) return;
		const found = recognize(stroke.points);
		if (!found) return;
		const color = stroke.color;
		this.#shape =
			found.kind === 'shape'
				? { id: stroke.id, kind: 'shape', shape: found.shape, x: found.x, y: found.y, w: found.w, h: found.h, color, fill: null, text: '' }
				: { id: stroke.id, kind: 'arrow', from: { x: found.from[0], y: found.from[1] }, to: { x: found.to[0], y: found.to[1] }, route: 'straight', color, width: 2.5, head: found.head };
		this.host.live = this.#shape;
		this.host.redraw();
	}

	up() {
		clearTimeout(this.#timer);
		const result = this.#shape ?? this.#stroke;
		this.#stroke = null;
		this.#shape = null;
		this.host.live = null;
		if (!result) return;
		const { board } = this.host;
		board.commit(this.host.label('easel-history-draw'), [...board.objects, result]);
	}
}
