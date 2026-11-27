import { t } from '@luft/i18n';
import { NOTE_COLORS, PEN_COLORS, type ShapeKind } from '#lib/board/model.js';
import { INK } from '#lib/board/render/look.js';
import type { BoardTool } from '#lib/board/tools/tool.js';

export const TOOL_KEYS: Partial<Record<BoardTool, string>> = { select: 'V', pen: 'P', highlighter: 'H', eraser: 'E', shape: 'S', arrow: 'A', text: 'T', note: 'N', frame: 'F' };
export const SHAPE_KEYS: Record<ShapeKind, string> = { rectangle: 'R', ellipse: 'O', diamond: 'D' };

const MODIFIERS = {
	ctrl: () => t('easel-key-ctrl'),
	shift: () => t('easel-key-shift')
};

export function hint(name: string, key: string, ...modifiers: (keyof typeof MODIFIERS)[]) {
	return t('easel-board-shortcut', { name, keys: [...modifiers.map((modifier) => MODIFIERS[modifier]()), key].join('+') });
}

const COLOR_NAMES: Record<string, () => string> = {
	[INK]: () => t('easel-board-ink'),
	[PEN_COLORS[1]]: () => t('easel-board-orange'),
	[PEN_COLORS[2]]: () => t('easel-board-blue'),
	[PEN_COLORS[3]]: () => t('easel-board-green'),
	[PEN_COLORS[4]]: () => t('easel-board-red'),
	[NOTE_COLORS[0]]: () => t('easel-board-yellow'),
	[NOTE_COLORS[1]]: () => t('easel-board-peach'),
	[NOTE_COLORS[2]]: () => t('easel-board-green'),
	[NOTE_COLORS[3]]: () => t('easel-board-blue'),
	[NOTE_COLORS[4]]: () => t('easel-board-lilac')
};

export const colorName = (color: string) => COLOR_NAMES[color]();
