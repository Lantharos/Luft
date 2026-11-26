import type { ToolEvent } from '#lib/tools/tool.js';
import type { BoardDocument } from '../board.svelte';
import type { BoardObject, Box, Route, ShapeKind } from '../model';

export type BoardTool = 'select' | 'pen' | 'highlighter' | 'eraser' | 'shape' | 'arrow' | 'text' | 'note' | 'frame' | 'picture';

export interface BoardHost {
	board: BoardDocument;
	scale(): number;
	ink(): string;
	shape(): ShapeKind;
	route(): Route;
	noteColor(): string;
	live: BoardObject | null;
	hidden: Set<string>;
	marquee: Box | null;
	edit(id: string): void;
	redraw(): void;
	label(key: string, args?: Record<string, string | number>): string;
}

export interface BoardHandler {
	down(event: ToolEvent): void;
	move?(event: ToolEvent): void;
	up?(event: ToolEvent): void;
}
