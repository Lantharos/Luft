import { t } from '@luft/i18n';
import { BoardDocument } from '#lib/board/board.svelte.js';
import { NOTE_COLORS, type BoardObject, type Box, type ShapeKind } from '#lib/board/model.js';
import { INK } from '#lib/board/render/look.js';
import { ArrowTool, PlaceTool, ShapeTool } from '#lib/board/tools/create.js';
import { DrawTool } from '#lib/board/tools/draw.js';
import { EraseTool } from '#lib/board/tools/erase.js';
import { SelectTool } from '#lib/board/tools/select.js';
import type { BoardHandler, BoardHost, BoardTool } from '#lib/board/tools/tool.js';
import type { ToolEvent, ToolHandler } from '#lib/tools/tool.js';
import { Viewport } from '#lib/viewport/viewport.svelte.js';

export class Whiteboard implements BoardHost {
	readonly viewport = new Viewport();
	tool = $state<BoardTool>('pen');
	color = $state(INK);
	shapeKind = $state<ShapeKind>('rectangle');
	note = $state(NOTE_COLORS[0]);
	marquee = $state<Box | null>(null);
	editing = $state<string | null>(null);
	live: BoardObject | null = null;
	readonly hidden = new Set<string>();
	readonly handlers: Record<Exclude<BoardTool, 'picture'>, BoardHandler>;
	readonly select: SelectTool;
	redraw: () => void = () => {};
	#active: BoardHandler | null = null;

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
			note: new PlaceTool(this, 'note')
		};
	}

	scale = () => this.viewport.scale;
	shape = () => this.shapeKind;
	noteColor = () => this.note;
	ink = () => this.color;
	label = (key: string) => t(key);

	edit(id: string) {
		this.editing = id;
		this.hidden.add(id);
		this.redraw();
	}

	finishEditing(text: string | null) {
		const id = this.editing;
		if (!id) return;
		this.editing = null;
		this.hidden.delete(id);
		const object = this.board.lookup(id);
		if (object && text !== null && 'text' in object && object.text !== text) {
			const changes = new Map<string, BoardObject | null>([[id, object.kind === 'text' && !text.trim() ? null : { ...object, text }]]);
			this.board.update(t('easel-history-text'), changes);
		} else if (object?.kind === 'text' && !object.text.trim()) {
			this.board.commit(t('easel-history-text'), this.board.objects.filter((other) => other.id !== id));
		}
		this.redraw();
	}

	choose(tool: BoardTool) {
		this.finishEditing(null);
		this.tool = tool;
		if (tool !== 'select') this.board.select([]);
	}

	readonly handler: ToolHandler = {
		down: (event: ToolEvent) => {
			this.finishEditing(null);
			this.#active = event.eraser ? this.handlers.eraser : this.handlers[this.tool === 'picture' ? 'select' : this.tool];
			this.#active.down(event);
		},
		move: (event: ToolEvent) => this.#active?.move?.(event),
		up: (event: ToolEvent) => {
			this.#active?.up?.(event);
			this.#active = null;
		}
	};
}
