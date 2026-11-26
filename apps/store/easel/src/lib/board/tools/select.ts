import type { ToolEvent } from '#lib/tools/tool.js';
import { arrowEnds, contains, hits } from '../geometry';
import type { Arrow, BoardObject, Box } from '../model';
import { moved, scaled } from '../transform';
import { attachAt } from './create';
import type { BoardHandler, BoardHost } from './tool';

const HANDLE_PX = 10;
const SLOP_PX = 5;
const MIN_SIZE = 4;

type Drag =
	| { kind: 'move'; start: [number, number]; before: BoardObject[] }
	| { kind: 'resize'; start: [number, number]; before: BoardObject[]; box: Box; proportional: boolean }
	| { kind: 'end'; arrow: Arrow; which: 'from' | 'to'; before: BoardObject[] }
	| { kind: 'marquee'; start: [number, number]; add: boolean };

export function selectionBox(host: BoardHost): Box | null {
	return host.board.boundsOf(host.board.selection);
}

export class SelectTool implements BoardHandler {
	#drag: Drag | null = null;

	constructor(private readonly host: BoardHost) {}

	#near(x: number, y: number, px: number, py: number) {
		return Math.hypot(x - px, y - py) * this.host.scale() <= HANDLE_PX;
	}

	topAt(x: number, y: number) {
		const { board } = this.host;
		const slop = SLOP_PX / this.host.scale();
		return [...board.objects].reverse().find((object) => hits(object, x, y, slop, board.lookup)) ?? null;
	}

	down(event: ToolEvent) {
		const { board } = this.host;
		const selection = board.selection;
		const box = selectionBox(this.host);
		const single = selection.length === 1 && selection[0].kind === 'arrow' ? (selection[0] as Arrow) : null;
		if (single) {
			const ends = arrowEnds(single, board.lookup);
			for (const [index, which] of (['from', 'to'] as const).entries()) {
				if (this.#near(event.x, event.y, ...ends[index])) {
					this.#drag = { kind: 'end', arrow: single, which, before: board.objects };
					return;
				}
			}
		}
		if (box && !single && this.#near(event.x, event.y, box.x + box.w, box.y + box.h)) {
			const proportional = event.shift || selection.some((object) => object.kind !== 'shape' && object.kind !== 'note');
			this.#drag = { kind: 'resize', start: [event.x, event.y], before: board.objects, box, proportional };
			return;
		}
		const hit = this.topAt(event.x, event.y);
		if (!hit) {
			if (!event.shift) board.select([]);
			this.#drag = { kind: 'marquee', start: [event.x, event.y], add: event.shift };
			return;
		}
		if (event.shift) {
			const next = new Set(board.selected);
			if (next.has(hit.id)) next.delete(hit.id);
			else next.add(hit.id);
			board.select(next);
		} else if (!board.selected.has(hit.id)) board.select([hit.id]);
		this.#drag = { kind: 'move', start: [event.x, event.y], before: board.objects };
	}

	move(event: ToolEvent) {
		const drag = this.#drag;
		if (!drag) return;
		const { board } = this.host;
		if (drag.kind === 'marquee') {
			const [x0, y0] = drag.start;
			this.host.marquee = { x: Math.min(x0, event.x), y: Math.min(y0, event.y), w: Math.abs(event.x - x0), h: Math.abs(event.y - y0) };
			this.host.redraw();
			return;
		}
		if (drag.kind === 'end') {
			const end = attachAt(this.host, event.x, event.y, drag.arrow[drag.which === 'from' ? 'to' : 'from'].attach ?? null);
			board.preview(drag.before.map((object) => (object.id === drag.arrow.id ? { ...drag.arrow, [drag.which]: end } : object)));
			return;
		}
		const moving = board.selected;
		if (drag.kind === 'move') {
			const dx = event.x - drag.start[0];
			const dy = event.y - drag.start[1];
			board.preview(drag.before.map((object) => (moving.has(object.id) ? moved(object, dx, dy) : object)));
			return;
		}
		const { box } = drag;
		let sx = Math.max(MIN_SIZE, box.w + event.x - drag.start[0]) / Math.max(1, box.w);
		let sy = Math.max(MIN_SIZE, box.h + event.y - drag.start[1]) / Math.max(1, box.h);
		if (drag.proportional) sx = sy = Math.max(sx, sy);
		board.preview(drag.before.map((object) => (moving.has(object.id) ? scaled(object, box.x, box.y, sx, sy) : object)));
	}

	up() {
		const drag = this.#drag;
		this.#drag = null;
		if (!drag) return;
		const { board } = this.host;
		if (drag.kind === 'marquee') {
			const area = this.host.marquee;
			this.host.marquee = null;
			if (area) {
				const inside = board.objects.filter((object) => contains(area, board.boundsOf([object])!)).map((object) => object.id);
				board.select(drag.add ? [...board.selected, ...inside] : inside);
			}
			this.host.redraw();
			return;
		}
		const label = drag.kind === 'resize' ? 'easel-history-resize' : 'easel-history-move';
		if (board.objects !== drag.before) board.commit(this.host.label(label), board.objects, drag.before);
	}
}
