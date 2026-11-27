import { t } from '@luft/i18n';
import { BoardDocument } from '#lib/board/board.svelte.js';
import { NOTE_COLORS, type BoardObject, type Box, type Route, type ShapeKind } from '#lib/board/model.js';
import { INK } from '#lib/board/render/look.js';
import { ArrowTool, FrameTool, PlaceTool, ShapeTool } from '#lib/board/tools/create.js';
import { DrawTool } from '#lib/board/tools/draw.js';
import { EraseTool } from '#lib/board/tools/erase.js';
import { SelectTool } from '#lib/board/tools/select.js';
import type { BoardHandler, BoardHost, BoardTool } from '#lib/board/tools/tool.js';
import type { ToolEvent, ToolHandler } from '#lib/tools/tool.js';
import { Viewport } from '#lib/viewport/viewport.svelte.js';

const DOUBLE_CLICK_MS = 500;
const DOUBLE_CLICK_PX = 6;

interface Tap {
	at: number;
	x: number;
	y: number;
	position: number;
}

export class Whiteboard implements BoardHost {
	readonly viewport = new Viewport();
	tool = $state<BoardTool>('pen');
	color = $state(INK);
	shapeKind = $state<ShapeKind>('rectangle');
	routing = $state<Route>('straight');
	note = $state(NOTE_COLORS[0]);
	marquee = $state<Box | null>(null);
	editing = $state<string | null>(null);
	draft = '';
	live: BoardObject | null = null;
	readonly hidden = new Set<string>();
	readonly handlers: Record<Exclude<BoardTool, 'picture'>, BoardHandler>;
	readonly select: SelectTool;
	redraw: () => void = () => {};
	#active: BoardHandler | null = null;
	#tap: Tap | null = null;

	constructor(readonly board: BoardDocument) {
		this.select = new SelectTool(this);
		const eraser = new EraseTool(this);
		this.handlers = {
			select: this.select,
			pen: new DrawTool(this, 'pen'),
			highlighter: new DrawTool(this, 'highlighter'),
			eraser,
			shape: new ShapeTool(this),
			arrow: new ArrowTool(this),
			text: new PlaceTool(this, 'text'),
			note: new PlaceTool(this, 'note'),
			frame: new FrameTool(this)
		};
	}

	scale = () => this.viewport.scale;
	shape = () => this.shapeKind;
	route = () => this.routing;
	noteColor = () => this.note;
	ink = () => this.color;
	label = (key: string, args?: Record<string, string | number>) => t(key, args);

	edit(id: string) {
		const object = this.board.lookup(id);
		this.editing = id;
		this.draft = object && 'text' in object ? object.text : '';
		this.redraw();
	}

	finishEditing(text = this.draft) {
		const id = this.editing;
		if (!id) return;
		this.editing = null;
		const object = this.board.lookup(id);
		if (object && 'text' in object && object.text !== text) {
			const changes = new Map<string, BoardObject | null>([[id, object.kind === 'text' && !text.trim() ? null : { ...object, text }]]);
			this.board.update(t('easel-history-text'), changes);
		} else if (object?.kind === 'text' && !object.text.trim()) {
			this.board.commit(t('easel-history-text'), this.board.objects.filter((other) => other.id !== id));
		}
		this.redraw();
	}

	choose(tool: BoardTool) {
		this.finishEditing();
		this.tool = tool;
		if (tool !== 'select') this.board.select([]);
	}

	chooseShape(kind: ShapeKind) {
		this.shapeKind = kind;
		this.choose('shape');
	}

	chooseRoute(route: Route) {
		this.routing = route;
		this.choose('arrow');
	}

	#doubleClicked(event: ToolEvent) {
		const tap = this.#tap;
		this.#tap = null;
		if (!tap || performance.now() - tap.at > DOUBLE_CLICK_MS || Math.hypot(event.localX - tap.x, event.localY - tap.y) > DOUBLE_CLICK_PX) return false;
		if (this.board.history.position === tap.position + 1) {
			this.editing = null;
			this.board.undo();
		}
		return true;
	}

	#write(event: ToolEvent) {
		this.finishEditing();
		const hit = this.select.topAt(event.x, event.y);
		if (hit && 'text' in hit) {
			this.board.select([hit.id]);
			this.edit(hit.id);
		} else this.handlers.text.down(event);
	}

	readonly handler: ToolHandler = {
		down: (event: ToolEvent) => {
			if (this.#doubleClicked(event)) return this.#write(event);
			this.finishEditing();
			this.#tap = { at: performance.now(), x: event.localX, y: event.localY, position: this.board.history.position };
			this.#active = event.eraser ? this.handlers.eraser : this.handlers[this.tool === 'picture' ? 'select' : this.tool];
			this.#active.down(event);
		},
		move: (event: ToolEvent) => {
			if (this.#tap && Math.hypot(event.localX - this.#tap.x, event.localY - this.#tap.y) > DOUBLE_CLICK_PX) this.#tap = null;
			this.#active?.move?.(event);
		},
		up: (event: ToolEvent) => {
			this.#active?.up?.(event);
			this.#active = null;
		}
	};
}
