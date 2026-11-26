import { t } from '@luft/i18n';
import type { BoardTool } from '#lib/board/tools/tool.js';
import type { ToolId } from '#lib/editor/settings.svelte.js';
import type { Adjust } from '#lib/gpu/shaders/adjust.js';
import type { BlendMode } from '#lib/gpu/shaders/blend.js';
import type { QuickMode } from '#lib/quick/quick.svelte.js';

export const toolLabel: Record<ToolId, () => string> = {
	move: () => t('easel-tool-move'),
	select: () => t('easel-tool-select'),
	lasso: () => t('easel-tool-lasso'),
	wand: () => t('easel-tool-wand'),
	brush: () => t('easel-tool-brush'),
	eraser: () => t('easel-tool-eraser'),
	clone: () => t('easel-tool-clone'),
	heal: () => t('easel-tool-heal'),
	smudge: () => t('easel-tool-smudge'),
	fill: () => t('easel-tool-fill'),
	gradient: () => t('easel-tool-gradient'),
	text: () => t('easel-tool-text'),
	shapes: () => t('easel-tool-shapes'),
	picker: () => t('easel-tool-picker'),
	crop: () => t('easel-tool-crop')
};

export const blendLabel: Record<BlendMode, () => string> = {
	normal: () => t('easel-blend-normal'),
	multiply: () => t('easel-blend-multiply'),
	screen: () => t('easel-blend-screen'),
	overlay: () => t('easel-blend-overlay'),
	darken: () => t('easel-blend-darken'),
	lighten: () => t('easel-blend-lighten'),
	'color-dodge': () => t('easel-blend-color-dodge'),
	'color-burn': () => t('easel-blend-color-burn'),
	'hard-light': () => t('easel-blend-hard-light'),
	'soft-light': () => t('easel-blend-soft-light'),
	difference: () => t('easel-blend-difference'),
	add: () => t('easel-blend-add')
};

export const boardToolLabel: Record<BoardTool, () => string> = {
	select: () => t('easel-board-select'),
	pen: () => t('easel-board-pen'),
	highlighter: () => t('easel-board-highlighter'),
	eraser: () => t('easel-board-eraser'),
	shape: () => t('easel-board-shape'),
	arrow: () => t('easel-board-arrow'),
	text: () => t('easel-board-text'),
	note: () => t('easel-board-note'),
	picture: () => t('easel-board-picture')
};

export const adjustLabel: Record<keyof Adjust, () => string> = {
	exposure: () => t('easel-adjust-exposure'),
	contrast: () => t('easel-adjust-contrast'),
	saturation: () => t('easel-adjust-saturation'),
	warmth: () => t('easel-adjust-warmth'),
	sharpen: () => t('easel-adjust-sharpen')
};

export const modeLabel: Record<QuickMode, () => string> = {
	crop: () => t('easel-mode-crop'),
	adjust: () => t('easel-mode-adjust'),
	markup: () => t('easel-mode-markup'),
	hide: () => t('easel-mode-hide'),
	size: () => t('easel-mode-size')
};

export const presetLabel: Record<string, () => string> = {
	hd: () => t('easel-preset-hd'),
	square: () => t('easel-preset-square'),
	a4: () => t('easel-preset-a4'),
	uhd: () => t('easel-preset-uhd')
};
