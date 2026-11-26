import { t } from '@luft/i18n';
import { commands } from '#lib/bindings.js';
import { boardArea, exportBoard, exportVector } from '#lib/files/board-file.js';
import { exportGrid, EXTENSIONS, type ExportChoice } from '#lib/files/export.js';
import type { App } from './app.svelte';

const CHOOSER = { timeoutMs: 24 * 60 * 60 * 1000 };

export function exportSize(app: App, area = '') {
	const screen = app.screen;
	if (screen.kind === 'editor') return { width: screen.editor.doc.width, height: screen.editor.doc.height };
	if (screen.kind === 'board') {
		const box = boardArea(screen.whiteboard.board, area);
		return { width: Math.round(box.w), height: Math.round(box.h) };
	}
	if (screen.kind === 'quick') return { width: screen.quick.doc.width, height: screen.quick.doc.height };
	return { width: 1, height: 1 };
}

export function exportAreas(app: App) {
	const screen = app.screen;
	if (screen.kind !== 'board') return [];
	const frame = screen.whiteboard.board.selection.find((object) => object.kind === 'frame');
	return frame?.kind === 'frame' ? [{ value: '', label: t('easel-export-board') }, { value: frame.id, label: frame.text.trim() || t('easel-board-frame') }] : [];
}

export async function runExport(app: App, choice: ExportChoice) {
	const screen = app.screen;
	if (screen.kind === 'home' || screen.kind === 'quick') return false;
	const extension = choice.format === 'svg' || choice.format === 'pdf' ? choice.format : EXTENSIONS[choice.format];
	const frame = screen.kind === 'board' ? screen.whiteboard.board.lookup(choice.area) : undefined;
	const name = frame?.kind === 'frame' && frame.text.trim() ? frame.text.trim() : screen.name;
	const path = await commands.chooseSave({ name: `${name}.${extension}`, folder: app.pictures }, CHOOSER);
	if (!path) return false;
	const { width, height } = exportSize(app);
	if (screen.kind === 'editor') {
		const { doc } = screen.editor;
		screen.editor.finishTool();
		doc.scene([1, 0, 0, 1, 0, 0]);
		await exportGrid(doc.compositor.levels[0], { path, format: choice.format as never, quality: choice.quality, width: Math.max(1, Math.round(width * choice.scale)), height: Math.max(1, Math.round(height * choice.scale)) });
		return true;
	}
	const { board } = screen.whiteboard;
	const area = boardArea(board, choice.area);
	if (choice.format === 'svg' || choice.format === 'pdf') await exportVector(board, path, choice.format === 'pdf', area);
	else await exportBoard(board, { path, format: choice.format, quality: choice.quality }, choice.scale, area);
	return true;
}
