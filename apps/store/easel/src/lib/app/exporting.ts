import { commands } from '#lib/bindings.js';
import { boardSize, exportBoard, exportVector } from '#lib/files/board-file.js';
import { exportGrid, EXTENSIONS, type ExportChoice } from '#lib/files/export.js';
import type { App } from './app.svelte';

const CHOOSER = { timeoutMs: 24 * 60 * 60 * 1000 };

export function exportSize(app: App) {
	const screen = app.screen;
	if (screen.kind === 'editor') return { width: screen.editor.doc.width, height: screen.editor.doc.height };
	if (screen.kind === 'board') return boardSize(screen.whiteboard.board);
	if (screen.kind === 'quick') return { width: screen.quick.doc.width, height: screen.quick.doc.height };
	return { width: 1, height: 1 };
}

export async function runExport(app: App, choice: ExportChoice) {
	const screen = app.screen;
	if (screen.kind === 'home' || screen.kind === 'quick') return false;
	const extension = choice.format === 'svg' || choice.format === 'pdf' ? choice.format : EXTENSIONS[choice.format];
	const path = await commands.chooseSave({ name: `${screen.name}.${extension}`, folder: app.pictures }, CHOOSER);
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
	if (choice.format === 'svg' || choice.format === 'pdf') await exportVector(board, path, choice.format === 'pdf');
	else await exportBoard(board, { path, format: choice.format, quality: choice.quality }, choice.scale);
	return true;
}
